namespace VttTools.GameService.Endpoints;

internal static class EndpointsMapperHelper {
    internal static Guid GetUserId(ClaimsPrincipal principal) {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim?.Value, out var userId)
                   ? userId
                   : Guid.Empty;
    }
}