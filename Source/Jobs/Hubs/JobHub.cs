namespace VttTools.Jobs.Hubs;

/// <summary>
/// SignalR hub for broadcasting job progress events to connected clients.
/// </summary>
[Authorize]
public class JobHub : Hub {
    /// <summary>
    /// Subscribes the current connection to receive updates for a specific job.
    /// </summary>
    /// <param name="jobId">The ID of the job to subscribe to.</param>
    /// <param name="ct">Cancellation token.</param>
    public async Task SubscribeToJob(Guid jobId, CancellationToken ct = default)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"job-{jobId}", ct);

    /// <summary>
    /// Unsubscribes the current connection from receiving updates for a specific job.
    /// </summary>
    /// <param name="jobId">The ID of the job to unsubscribe from.</param>
    /// <param name="ct">Cancellation token.</param>
    public async Task UnsubscribeFromJob(Guid jobId, CancellationToken ct = default)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"job-{jobId}", ct);
}

/// <summary>
/// Extension methods for broadcasting job events via the JobHub.
/// </summary>
public static class JobHubExtensions {
    /// <summary>
    /// Broadcasts a job progress event to all clients subscribed to the job.
    /// </summary>
    /// <param name="hubContext">The hub context.</param>
    /// <param name="progressEvent">The progress event to broadcast.</param>
    /// <param name="ct">Cancellation token.</param>
    public static async Task SendProgressAsync(
        this IHubContext<JobHub> hubContext,
        JobProgressEvent progressEvent,
        CancellationToken ct = default)
        => await hubContext.Clients.Group($"job-{progressEvent.JobId}")
            .SendAsync("ReceiveProgress", progressEvent, ct);

    /// <summary>
    /// Broadcasts a job completed event to all clients subscribed to the job.
    /// </summary>
    /// <param name="hubContext">The hub context.</param>
    /// <param name="completedEvent">The completed event to broadcast.</param>
    /// <param name="ct">Cancellation token.</param>
    public static async Task SendJobCompletedAsync(
        this IHubContext<JobHub> hubContext,
        JobCompletedEvent completedEvent,
        CancellationToken ct = default)
        => await hubContext.Clients.Group($"job-{completedEvent.JobId}")
            .SendAsync("JobCompleted", completedEvent, ct);
}
