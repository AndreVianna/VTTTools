using System.Security.Claims;
using VttTools.Auth.ApiContracts;

namespace VttTools.Auth.Handlers;

public static class AuthHandlers {
    public static async Task<Microsoft.AspNetCore.Http.IResult> LoginHandler(
        [FromBody] LoginRequest request,
        IAuthService authService) {

        var response = await authService.LoginAsync(request);
        return response.Success
            ? Results.Ok(response)
            : Results.BadRequest(response);
    }

    public static async Task<Microsoft.AspNetCore.Http.IResult> RegisterHandler(
        [FromBody] RegisterRequest request,
        IAuthService authService) {

        var response = await authService.RegisterAsync(request);
        return response.Success
            ? Results.Ok(response)
            : Results.BadRequest(response);
    }

    public static async Task<Microsoft.AspNetCore.Http.IResult> LogoutHandler(IAuthService authService) {
        var response = await authService.LogoutAsync();
        return Results.Ok(response);
    }

    public static async Task<Microsoft.AspNetCore.Http.IResult> GetCurrentUserHandler(
        ClaimsPrincipal user,
        IAuthService authService) {

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId)) {
            return Results.Unauthorized();
        }

        var response = await authService.GetCurrentUserAsync(userId);
        return response.Success
            ? Results.Ok(response)
            : Results.BadRequest(response);
    }
}