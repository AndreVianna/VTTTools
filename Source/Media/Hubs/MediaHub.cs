using VttTools.Media.Authorization;

namespace VttTools.Media.Hubs;

[Authorize]
public class MediaHub(IAuthorizationService authService, ILogger<MediaHub> logger) : Hub<IMediaHubClient> {
    public async Task SubscribeToResource(string resourceId) {
        if (string.IsNullOrWhiteSpace(resourceId)) {
            logger.LogWarning("SubscribeToResource called with empty resourceId by connection {ConnectionId}", Context.ConnectionId);
            throw new HubException("Invalid resource ID");
        }

        if (!Guid.TryParse(resourceId, out _)) {
            logger.LogWarning("SubscribeToResource called with invalid resourceId '{ResourceId}' by connection {ConnectionId}", resourceId, Context.ConnectionId);
            throw new HubException("Invalid resource ID format");
        }

        var authResult = await authService.AuthorizeAsync(Context.User!, resourceId, new ResourceOwnerRequirement());
        if (!authResult.Succeeded) {
            logger.LogWarning("Connection {ConnectionId} unauthorized to subscribe to resource {ResourceId}", Context.ConnectionId, resourceId);
            throw new HubException("You are not authorized to subscribe to this resource");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"resource-{resourceId}");
        logger.LogDebug("Connection {ConnectionId} subscribed to resource {ResourceId}", Context.ConnectionId, resourceId);
    }

    public async Task UnsubscribeFromResource(string resourceId) {
        if (string.IsNullOrWhiteSpace(resourceId)) {
            return;
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"resource-{resourceId}");
        logger.LogDebug("Connection {ConnectionId} unsubscribed from resource {ResourceId}", Context.ConnectionId, resourceId);
    }

    public override Task OnConnectedAsync() {
        logger.LogDebug("Connection {ConnectionId} connected to MediaHub", Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception) {
        if (exception is not null) {
            logger.LogWarning(exception, "Connection {ConnectionId} disconnected from MediaHub with error", Context.ConnectionId);
        }
        else {
            logger.LogDebug("Connection {ConnectionId} disconnected from MediaHub", Context.ConnectionId);
        }

        return base.OnDisconnectedAsync(exception);
    }
}