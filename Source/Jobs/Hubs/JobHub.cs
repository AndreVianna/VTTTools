namespace VttTools.Jobs.Hubs;

[Authorize]
public class JobHub : Hub {
    public Task SubscribeToJob(Guid jobId, CancellationToken ct = default)
        => Groups.AddToGroupAsync(Context.ConnectionId, $"job-{jobId}", ct);

    public Task UnsubscribeFromJob(Guid jobId, CancellationToken ct = default)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, $"job-{jobId}", ct);
}