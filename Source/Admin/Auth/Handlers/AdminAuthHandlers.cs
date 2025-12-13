using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Auth.Handlers;

public static class AdminAuthHandlers {
    public static async Task<IResult> LoginHandler(
        [FromBody] AdminLoginRequest request,
        IAdminAuthService authService,
        CancellationToken ct) {

        var response = await authService.LoginAsync(request, ct);

        return response.Success || response.RequiresTwoFactor
            ? Results.Ok(response)
            : Results.Unauthorized();
    }

    public static async Task<IResult> LogoutHandler(
        IAdminAuthService authService,
        CancellationToken ct) {

        var response = await authService.LogoutAsync(ct);

        return response.Success
            ? Results.Ok(response)
            : Results.BadRequest(new { error = "Logout failed" });
    }

    public static async Task<IResult> GetCurrentUserHandler(
        ClaimsPrincipal user,
        IAdminAuthService authService,
        CancellationToken ct) {

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId)) {
            return Results.Unauthorized();
        }

        var adminUser = await authService.GetCurrentUserAsync(userId, ct);

        return adminUser is null
            ? Results.Unauthorized()
            : Results.Ok(adminUser);
    }

    public static async Task<IResult> GetSessionStatusHandler(
        IAdminAuthService authService,
        CancellationToken ct) {

        var response = await authService.GetSessionStatusAsync(ct);

        return Results.Ok(response);
    }
}