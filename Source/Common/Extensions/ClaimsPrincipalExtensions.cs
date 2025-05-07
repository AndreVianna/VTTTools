namespace VttTools.Extensions;

public static class ClaimsPrincipalExtensions {
    public static Guid GetUserId(this ClaimsPrincipal principal) {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim?.Value, out var userId)
                   ? userId
                   : Guid.Empty;
    }
}