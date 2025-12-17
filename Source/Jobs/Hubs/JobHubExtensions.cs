namespace VttTools.Jobs.Hubs;

public static class JobHubExtensions {
    private const string _jobEventChannel = "JobEvent";
    private const string _jobItemEventChannel = "JobItemEvent";

    public static Task SendJobCreatedAsync(
        this IHubContext<JobHub> hubContext,
        JobCreatedEvent createdEvent,
        CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{createdEvent.JobId}").SendAsync(_jobEventChannel, createdEvent, ct);

    public static Task SendJobCompletedAsync(
        this IHubContext<JobHub> hubContext,
        JobCompletedEvent completedEvent,
        CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{completedEvent.JobId}").SendAsync(_jobEventChannel, completedEvent, ct);

    public static Task SendJobCanceledAsync(
        this IHubContext<JobHub> hubContext,
        JobCanceledEvent canceledEvent,
        CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{canceledEvent.JobId}").SendAsync(_jobEventChannel, canceledEvent, ct);

    public static Task SendJobRetriedAsync(
        this IHubContext<JobHub> hubContext,
        JobRetriedEvent retriedEvent,
        CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{retriedEvent.JobId}").SendAsync(_jobEventChannel, retriedEvent, ct);

    public static Task SendJobItemStartedAsync(
        this IHubContext<JobHub> hubContext,
        JobItemStartedEvent startedEvent,
        CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{startedEvent.JobId}").SendAsync(_jobItemEventChannel, startedEvent, ct);

    public static Task SendJobItemCompletedAsync(
        this IHubContext<JobHub> hubContext,
        JobItemCompletedEvent completedEvent,
        CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{completedEvent.JobId}").SendAsync(_jobItemEventChannel, completedEvent, ct);
}
