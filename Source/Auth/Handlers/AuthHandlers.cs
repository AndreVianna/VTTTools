using System.Security.Claims;

using VttTools.Auth.ApiContracts;

namespace VttTools.Auth.Handlers;

public static class AuthHandlers {
    public static async Task<Microsoft.AspNetCore.Http.IResult> LoginHandler(
        [FromBody] LoginRequest request,
        IAuthService authService) {

        var response = await authService.LoginAsync(request);

        if (response.Success)
            return Results.Ok(response);

        // Return structured error for login failures
        var errors = new Dictionary<string, string[]> {
            [""] = [response.Message ?? "Login failed"]
        };

        return Results.ValidationProblem(errors);
    }

    public static async Task<Microsoft.AspNetCore.Http.IResult> RegisterHandler(
        [FromBody] RegisterRequest request,
        IAuthService authService) {

        var response = await authService.RegisterAsync(request);

        if (response.Success)
            return Results.Ok(response);

        // Return proper HTTP status based on error type
        if (response.Message?.Contains("already exists") == true)
            return Results.Conflict(new { error = response.Message });

        // Parse Identity validation errors into ValidationProblemDetails format
        var errors = new Dictionary<string, string[]>();

        // Check for specific error types from Identity
        if (response.Message?.Contains("Password") == true) {
            errors["password"] = [response.Message];
        }
        else if (response.Message?.Contains("Email") == true || response.Message?.Contains("email") == true) {
            errors["email"] = [response.Message];
        }
        else if (response.Message?.Contains("Name") == true || response.Message?.Contains("name") == true) {
            errors["name"] = [response.Message];
        }
        else {
            // Generic error
            errors[""] = [response.Message ?? "Registration failed"];
        }

        return Results.ValidationProblem(errors);
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

        if (response.Success)
            return Results.Ok(response);

        // Return structured error if user not found
        var errors = new Dictionary<string, string[]> {
            ["userId"] = [response.Message ?? "User not found"]
        };

        return Results.ValidationProblem(errors);
    }
}