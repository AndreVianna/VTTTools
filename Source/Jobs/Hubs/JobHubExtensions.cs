namespace VttTools.Jobs.Hubs;

public static class JobHubExtensions {
    public static Task SendProgressAsync(
        this IHubContext<JobHub> hubContext,
        JobProgressEvent progressEvent,
        CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{progressEvent.JobId}").SendAsync("ReceiveProgress", progressEvent, ct);

    public static Task SendItemUpdateAsync(
        this IHubContext<JobHub> hubContext,
        JobItemUpdateEvent progressEvent,
        CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{progressEvent.JobId}").SendAsync("ReceiveProgress", progressEvent, ct);

    public static Task SendJobCompletedAsync(
        this IHubContext<JobHub> hubContext,
        JobCompletedEvent completedEvent,
        CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{completedEvent.JobId}").SendAsync("JobCompleted", completedEvent, ct);
}
