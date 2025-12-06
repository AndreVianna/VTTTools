namespace VttTools.Middlewares;

public class TokenRefreshMiddleware(
    RequestDelegate next,
    ILogger<TokenRefreshMiddleware> logger) {

    public async Task InvokeAsync(HttpContext context, IJwtTokenService jwtTokenService, UserManager<User> userManager) {
        await next(context);

        if (context.Response.StatusCode is not 200 and not 204) {
            return;
        }

        var path = context.Request.Path.ToString();
        if (path.Contains("/api/admin/audit", StringComparison.OrdinalIgnoreCase)) {
            return;
        }

        if (!context.User.Identity?.IsAuthenticated ?? true) {
            return;
        }

        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId)) {
            return;
        }

        try {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user == null) {
                return;
            }

            var roles = await userManager.GetRolesAsync(user);

            var newToken = jwtTokenService.GenerateToken(user, roles, rememberMe: false);

            context.Response.Headers.Append("X-Refreshed-Token", newToken);
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Failed to refresh token for user {UserId}", userId);
        }
    }
}