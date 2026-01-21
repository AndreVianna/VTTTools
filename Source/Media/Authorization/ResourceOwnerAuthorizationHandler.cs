namespace VttTools.Media.Authorization;

public class ResourceOwnerAuthorizationHandler(
    IMediaStorage mediaStorage,
    ILogger<ResourceOwnerAuthorizationHandler> logger)
    : AuthorizationHandler<ResourceOwnerRequirement, string> {
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ResourceOwnerRequirement requirement,
        string resourceId) {
        if (!Guid.TryParse(resourceId, out var parsedResourceId) || parsedResourceId == Guid.Empty)
            return;

        var resource = await mediaStorage.FindByIdAsync(parsedResourceId);
        if (resource is null)
            return;

        logger.LogDebug("[DEBUG] HandleRequirementAsync: Resource '{Id}', Owned by '{OwnerId}'", resourceId, resource.OwnerId);
        try {
            var userId = context.User.GetUserId();
            if (resource.OwnerId == userId)
                context.Succeed(requirement);
        }
        catch (UnauthorizedAccessException ex) {
            logger.LogWarning(ex, "Unauthorized access attempt to resource '{ResourceID}'!", resourceId);
        }
    }
}