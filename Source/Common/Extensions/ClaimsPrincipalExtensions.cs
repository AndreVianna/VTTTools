namespace VttTools.Extensions;

public static class ClaimsPrincipalExtensions {
    public static Guid GetUserId(this ClaimsPrincipal principal) {
        var userIdClaim = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}