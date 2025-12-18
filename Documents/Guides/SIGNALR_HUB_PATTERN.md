# SignalR Hub Pattern Guide

This guide documents the SignalR real-time communication pattern used in VTTTools for pushing events from backend services to connected clients.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Service Layer  │────▶│  EventPublisher  │────▶│    SignalR Hub  │
│  (JobService)   │     │  (via HubContext)│     │    (JobHub)     │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Component│◀────│  useJobsHub      │◀────│  useSignalRHub  │
│                 │     │  (domain-specific)│     │  (generic)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Backend Implementation

### 1. Hub Client Interface

Define the contract for events the hub can push to clients.

**Location**: `Source/Domain/{Area}/Hubs/I{Area}HubClient.cs`

```csharp
namespace VttTools.Jobs.Hubs;

public interface IJobHubClient {
    Task PublishJobEvent(IJobEvent jobEvent);
    Task PublishJobItemEvent(IJobItemEvent jobItemEvent);
}
```

### 2. Hub Implementation

The hub handles client subscriptions to groups and authorization.

**Location**: `Source/{Area}/Hubs/{Area}Hub.cs`

```csharp
namespace VttTools.Jobs.Hubs;

[Authorize]
public class JobHub(IAuthorizationService authService, ILogger<JobHub> logger)
    : Hub<IJobHubClient> {

    public async Task SubscribeToJob(string jobId) {
        if (string.IsNullOrWhiteSpace(jobId)) {
            logger.LogWarning("SubscribeToJob called with empty jobId");
            throw new HubException("Invalid job ID");
        }

        if (!Guid.TryParse(jobId, out var parsedJobId) || parsedJobId == Guid.Empty) {
            throw new HubException("Invalid job ID format");
        }

        // Use policy-based authorization
        var authResult = await authService.AuthorizeAsync(Context.User!, jobId, "JobOwner");
        if (!authResult.Succeeded) {
            logger.LogWarning("Access denied for job {JobId}", jobId);
            throw new HubException("Access denied");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"job-{jobId}");
        logger.LogDebug("Connection {ConnectionId} subscribed to job {JobId}",
            Context.ConnectionId, jobId);
    }

    public async Task UnsubscribeFromJob(string jobId) {
        if (string.IsNullOrWhiteSpace(jobId)) return;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"job-{jobId}");
    }

    public override Task OnConnectedAsync() {
        logger.LogDebug("Connection {ConnectionId} connected", Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception) {
        if (exception is not null) {
            logger.LogWarning(exception, "Connection {ConnectionId} disconnected with error",
                Context.ConnectionId);
        }
        return base.OnDisconnectedAsync(exception);
    }
}
```

### 3. Event Publisher Interface

**Location**: `Source/Domain/{Area}/Services/I{Area}EventPublisher.cs`

```csharp
namespace VttTools.Jobs.Services;

public interface IJobEventPublisher {
    Task PublishJobEventAsync(IJobEvent jobEvent, CancellationToken ct = default);
    Task PublishJobItemEventAsync(IJobItemEvent jobItemEvent, CancellationToken ct = default);
}
```

### 4. Event Publisher Implementation

Uses `IHubContext` to push events to SignalR groups.

**Location**: `Source/{Area}/Services/{Area}EventPublisher.cs`

```csharp
namespace VttTools.Jobs.Services;

public class JobEventPublisher(IHubContext<JobHub, IJobHubClient> hubContext)
    : IJobEventPublisher {

    public Task PublishJobEventAsync(IJobEvent jobEvent, CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{jobEvent.JobId}").PublishJobEvent(jobEvent);

    public Task PublishJobItemEventAsync(IJobItemEvent jobItemEvent, CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{jobItemEvent.JobId}").PublishJobItemEvent(jobItemEvent);
}
```

### 5. Event Collector Pattern (Transaction Safety)

Collect events during operations, publish only after all DB commits succeed.

**Location**: `Source/{Area}/Services/{Area}EventCollector.cs`

```csharp
namespace VttTools.Jobs.Services;

internal sealed class JobEventCollector {
    private readonly List<IJobEvent> _jobEvents = [];
    private readonly List<IJobItemEvent> _itemEvents = [];

    public void AddJobEvent(IJobEvent @event) => _jobEvents.Add(@event);
    public void AddItemEvent(IJobItemEvent @event) => _itemEvents.Add(@event);

    public async Task PublishAllAsync(IJobEventPublisher publisher, CancellationToken ct = default) {
        foreach (var @event in _jobEvents)
            await publisher.PublishJobEventAsync(@event, ct);
        foreach (var @event in _itemEvents)
            await publisher.PublishJobItemEventAsync(@event, ct);
    }
}
```

**Usage in Service**:

```csharp
public async Task<Job> UpdateAsync(Guid jobId, UpdateJobData data, CancellationToken ct = default) {
    var collector = new JobEventCollector();

    // Collect events during operation
    foreach (var item in data.Items) {
        collector.AddItemEvent(new JobItemCompletedEvent { ... });
    }

    // All database operations
    await storage.UpdateAsync(job, ct);
    await auditService.LogAsync(..., ct);

    // Publish events AFTER all DB commits succeed
    await collector.PublishAllAsync(eventPublisher, ct);

    return job;
}
```

### 6. Authorization Handler

Resource-based authorization for hub subscriptions.

**Location**: `Source/{Area}/Authorization/{Resource}AuthorizationHandler.cs`

```csharp
namespace VttTools.Jobs.Authorization;

public class JobOwnerRequirement : IAuthorizationRequirement;

public class JobOwnerAuthorizationHandler(IJobStorage jobStorage)
    : AuthorizationHandler<JobOwnerRequirement, string> {

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        JobOwnerRequirement requirement,
        string jobId) {

        if (!Guid.TryParse(jobId, out var parsedJobId) || parsedJobId == Guid.Empty)
            return;

        var job = await jobStorage.GetByIdAsync(parsedJobId);
        if (job is null)
            return;

        try {
            var userId = context.User.GetUserId();
            if (job.OwnerId == userId)
                context.Succeed(requirement);
        }
        catch (UnauthorizedAccessException) {
            // User not authenticated - requirement not met
        }
    }
}
```

### 7. Program.cs Registration

```csharp
internal static void AddServices(this IHostApplicationBuilder builder) {
    // Event publisher
    builder.Services.AddScoped<IJobEventPublisher, JobEventPublisher>();

    // Authorization policy
    builder.Services.AddAuthorizationBuilder()
        .AddPolicy("JobOwner", policy => policy.Requirements.Add(new JobOwnerRequirement()));
    builder.Services.AddScoped<IAuthorizationHandler, JobOwnerAuthorizationHandler>();

    // SignalR
    builder.Services.AddSignalR();
}

internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
    app.MapHub<JobHub>("/hubs/jobs");
}
```

## Frontend Implementation

### 1. Generic SignalR Hook

Reusable hook for any SignalR hub connection.

**Location**: `Source/WebComponents/src/hooks/useSignalRHub.ts`

```typescript
export interface SignalRHubConfig {
    hubUrl: string;
    getAccessToken?: (() => string | null) | undefined;  // Optional - uses cookies if not provided
    maxReconnectAttempts?: number;
    logLevel?: signalR.LogLevel;
}

export interface UseSignalRHubOptions<TEvents extends Record<string, unknown>> {
    config: SignalRHubConfig;
    eventHandlers?: EventHandlers<TEvents> | undefined;
    onConnectionStateChanged?: ((state: signalR.HubConnectionState) => void) | undefined;
    autoConnect?: boolean | undefined;
}

export interface UseSignalRHubReturn {
    connectionState: signalR.HubConnectionState;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    invoke: <T = void>(methodName: string, ...args: unknown[]) => Promise<T>;
    subscribeToGroup: (methodName: string, groupId: string) => Promise<void>;
    unsubscribeFromGroup: (methodName: string, groupId: string) => Promise<void>;
    error: Error | null;
    isConnected: boolean;
    failedSubscriptions: string[];
    isResubscribing: boolean;
    retryFailedSubscriptions: () => Promise<void>;
}
```

**Key Features**:
- Automatic reconnection with exponential backoff
- Subscription tracking and automatic resubscription on reconnect
- Failed subscription tracking with manual retry capability
- Cookie-based authentication (httpOnly) or token-based authentication
- Proper cleanup on unmount

### 2. Domain-Specific Hub Hook

Wraps the generic hook with domain-specific event handling.

**Location**: `Source/WebAdminApp/src/hooks/useJobsHub.ts`

```typescript
type JobHubEvents = {
    publishJobEvent: JobEvent;
    publishJobItemEvent: JobItemEvent;
    [key: string]: unknown;
};

export interface UseJobsHubOptions {
    onJobCreated?: (event: JobCreatedEvent) => void;
    onJobCompleted?: (event: JobCompletedEvent) => void;
    onJobCanceled?: (event: JobCanceledEvent) => void;
    onJobRetried?: (event: JobRetriedEvent) => void;
    onJobItemStarted?: (event: JobItemStartedEvent) => void;
    onJobItemCompleted?: (event: JobItemCompletedEvent) => void;
    onConnectionStateChanged?: (state: signalR.HubConnectionState) => void;
    autoConnect?: boolean;
}

export function useJobsHub(options: UseJobsHubOptions = {}): UseJobsHubReturn {
    const { onJobCreated, onJobCompleted, ... } = options;

    // Dispatch events to specific callbacks
    const handleJobEvent = useCallback((event: JobEvent) => {
        switch (event.eventType) {
            case 'JobCreated': onJobCreated?.(event); break;
            case 'JobCompleted': onJobCompleted?.(event); break;
            // ...
        }
    }, [onJobCreated, onJobCompleted, ...]);

    const eventHandlers = useMemo(() => ({
        publishJobEvent: handleJobEvent as (event: unknown) => void,
        publishJobItemEvent: handleJobItemEvent as (event: unknown) => void,
    }), [handleJobEvent, handleJobItemEvent]);

    const { subscribeToGroup, unsubscribeFromGroup, ... } = useSignalRHub<JobHubEvents>({
        config: { hubUrl: '/hubs/jobs' },  // Cookie auth - no token needed
        eventHandlers,
        onConnectionStateChanged,
        autoConnect,
    });

    // Wrap with domain-specific method names
    const subscribeToJob = useCallback(async (jobId: string) => {
        await subscribeToGroup('SubscribeToJob', jobId);
    }, [subscribeToGroup]);

    return { subscribeToJob, unsubscribeFromJob, ... };
}
```

### 3. Component Usage

```typescript
const JobMonitor: React.FC<{ jobId: string }> = ({ jobId }) => {
    const [status, setStatus] = useState<JobStatus>('Pending');

    const { connect, subscribeToJob, connectionState } = useJobsHub({
        onJobCompleted: (event) => {
            setStatus('Completed');
            // Update UI, show notification, etc.
        },
        onJobItemCompleted: (event) => {
            // Update progress bar, etc.
        },
    });

    useEffect(() => {
        connect()
            .then(() => subscribeToJob(jobId))
            .catch(console.error);
    }, [connect, subscribeToJob, jobId]);

    return (
        <div>
            <span>Connection: {connectionState}</span>
            <span>Status: {status}</span>
        </div>
    );
};
```

## Authentication

### Cookie-Based Authentication (Recommended)

Uses httpOnly cookies for security - tokens are not accessible to JavaScript.

**Backend** (`HostApplicationBuilderExtensions.cs`):

```csharp
options.Events = new JwtBearerEvents {
    OnMessageReceived = context => {
        if (!string.IsNullOrEmpty(context.Token))
            return Task.CompletedTask;

        // SignalR WebSocket negotiation - check query string first
        var path = context.HttpContext.Request.Path;
        if (path.StartsWithSegments("/hubs")) {
            var accessToken = context.Request.Query["access_token"];
            if (!string.IsNullOrEmpty(accessToken)) {
                context.Token = accessToken;
                return Task.CompletedTask;
            }
        }

        // Check httpOnly cookies
        if (context.Request.Cookies.TryGetValue(AuthCookieConstants.AdminCookieName, out var token)) {
            context.Token = token;
        }
        return Task.CompletedTask;
    }
};
```

**Frontend**: No configuration needed - cookies are sent automatically with `withCredentials: true`.

```typescript
const { ... } = useSignalRHub({
    config: { hubUrl: '/hubs/jobs' },  // No getAccessToken needed
    ...
});
```

### Token-Based Authentication (Legacy)

For cases where cookies can't be used.

```typescript
const { ... } = useSignalRHub({
    config: {
        hubUrl: '/hubs/jobs',
        getAccessToken: () => localStorage.getItem('token'),
    },
    ...
});
```

## Event Types

### Discriminated Union Pattern

Events use a `eventType` discriminator for type-safe handling.

```typescript
// Base event types
interface JobEventBase {
    jobId: string;
    timestamp: string;
}

// Specific event types
interface JobCreatedEvent extends JobEventBase {
    eventType: 'JobCreated';
    ownerId: string;
    jobType: string;
}

interface JobCompletedEvent extends JobEventBase {
    eventType: 'JobCompleted';
    result: JobResult;
}

// Union type
type JobEvent = JobCreatedEvent | JobCompletedEvent | JobCanceledEvent | JobRetriedEvent;
```

## Best Practices

### DO

1. **Use Event Collector** - Collect events during operations, publish after DB commits
2. **Use Policy-Based Authorization** - Define authorization policies, use in hub
3. **Use Cookie Authentication** - httpOnly cookies prevent XSS token theft
4. **Track Subscriptions** - Handle reconnection gracefully with automatic resubscription
5. **Use Typed Hub Clients** - `Hub<IJobHubClient>` for type-safe event publishing
6. **Log Connection Events** - Debug-level logging for troubleshooting

### DON'T

1. **Publish Before Commit** - Never publish events before DB transaction completes
2. **Store Tokens in localStorage** - Use httpOnly cookies instead
3. **Duplicate Authorization Logic** - Use shared policies, not inline checks
4. **Ignore Failed Subscriptions** - Expose failures to UI for user action
5. **Forget Cleanup** - Always disconnect/unsubscribe on component unmount

## Troubleshooting

### Connection Fails with 401

- Check cookie is being sent (DevTools → Network → Request Headers)
- Verify JWT configuration reads from cookies
- Check CORS allows credentials: `AllowCredentials()`

### Events Not Received

- Verify client subscribed to correct group
- Check hub method names match (case-sensitive)
- Verify event is published to correct group name

### Reconnection Issues

- Check `failedSubscriptions` array in hook return
- Call `retryFailedSubscriptions()` to retry
- Verify authorization still valid after reconnect

## File Locations Summary

| Component | Location |
|-----------|----------|
| Hub Client Interface | `Source/Domain/{Area}/Hubs/I{Area}HubClient.cs` |
| Hub Implementation | `Source/{Area}/Hubs/{Area}Hub.cs` |
| Event Publisher Interface | `Source/Domain/{Area}/Services/I{Area}EventPublisher.cs` |
| Event Publisher | `Source/{Area}/Services/{Area}EventPublisher.cs` |
| Event Collector | `Source/{Area}/Services/{Area}EventCollector.cs` |
| Authorization Handler | `Source/{Area}/Authorization/{Resource}AuthorizationHandler.cs` |
| Generic SignalR Hook | `Source/WebComponents/src/hooks/useSignalRHub.ts` |
| Domain-Specific Hook | `Source/Web{App}/src/hooks/use{Area}Hub.ts` |
| Event Types | `Source/Web{App}/src/types/{area}.ts` |
