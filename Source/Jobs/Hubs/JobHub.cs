namespace VttTools.Jobs.Hubs;

[Authorize]
public class JobHub(IAuthorizationService authService, ILogger<JobHub> logger) : Hub<IJobHubClient> {
    public async Task SubscribeToJob(string jobId) {
        if (string.IsNullOrWhiteSpace(jobId)) {
            logger.LogWarning("SubscribeToJob called with empty jobId by connection {ConnectionId}", Context.ConnectionId);
            throw new HubException("Invalid job ID");
        }

        if (!Guid.TryParse(jobId, out var parsedJobId) || parsedJobId == Guid.Empty) {
            logger.LogWarning("SubscribeToJob called with invalid jobId '{JobId}' by connection {ConnectionId}", jobId, Context.ConnectionId);
            throw new HubException("Invalid job ID format");
        }

        var authResult = await authService.AuthorizeAsync(Context.User!, jobId, "JobOwner");
        if (!authResult.Succeeded) {
            logger.LogWarning("SubscribeToJob: Access denied for job {JobId} by connection {ConnectionId}", jobId, Context.ConnectionId);
            throw new HubException("Access denied");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"job-{jobId}");
        logger.LogDebug("Connection {ConnectionId} subscribed to job {JobId}", Context.ConnectionId, jobId);
    }

    public async Task UnsubscribeFromJob(string jobId) {
        if (string.IsNullOrWhiteSpace(jobId)) {
            return;
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"job-{jobId}");
        logger.LogDebug("Connection {ConnectionId} unsubscribed from job {JobId}", Context.ConnectionId, jobId);
    }

    public override Task OnConnectedAsync() {
        logger.LogDebug("Connection {ConnectionId} connected to JobHub", Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception) {
        if (exception is not null) {
            logger.LogWarning(exception, "Connection {ConnectionId} disconnected from JobHub with error", Context.ConnectionId);
        }
        else {
            logger.LogDebug("Connection {ConnectionId} disconnected from JobHub", Context.ConnectionId);
        }

        return base.OnDisconnectedAsync(exception);
    }
}
