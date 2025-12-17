namespace VttTools.Jobs.Hubs;

[Authorize]
public class JobHub : Hub {
    public Task SubscribeToJob(string jobId)
        => Groups.AddToGroupAsync(Context.ConnectionId, $"job-{jobId}");

    public Task UnsubscribeFromJob(string jobId)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, $"job-{jobId}");
}