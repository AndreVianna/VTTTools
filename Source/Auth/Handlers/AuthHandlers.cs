
namespace VttTools.Auth.Handlers;

public static class AuthHandlers {
    public static async Task<IResult> LoginHandler(
        [FromBody] LoginRequest request,
        IAuthService authService,
        HttpContext httpContext,
        IWebHostEnvironment environment) {

        var response = await authService.LoginAsync(request);

        if (response is { Success: true, Token: not null }) {
            var cookieOptions = AuthCookieConstants.CreateSecureCookie(environment.IsDevelopment());
            httpContext.Response.Cookies.Append(AuthCookieConstants.ClientCookieName, response.Token, cookieOptions);
            return Results.Ok(response with { Token = null });
        }

        if (response.Success)
            return Results.Ok(response);

        var errors = new Dictionary<string, string[]> {
            [""] = [response.Message ?? "Login failed"]
        };

        return Results.ValidationProblem(errors);
    }

    public static async Task<IResult> RegisterHandler(
        [FromBody] RegisterRequest request,
        IAuthService authService) {

        var response = await authService.RegisterAsync(request);

        if (response.Success)
            return Results.Ok(response);

        // Return proper HTTP status based on error type
        if (response.Message?.Contains("DuplicatedUser") == true || response.Message?.Contains("already exists") == true)
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

    public static async Task<IResult> LogoutHandler(
        IAuthService authService,
        HttpContext httpContext,
        IWebHostEnvironment environment) {

        var response = await authService.LogoutAsync();

        var cookieOptions = AuthCookieConstants.CreateExpiredCookie(environment.IsDevelopment());
        httpContext.Response.Cookies.Delete(AuthCookieConstants.ClientCookieName, cookieOptions);

        return Results.Ok(response);
    }

    public static async Task<IResult> GetCurrentUserHandler(
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

    public static async Task<IResult> ForgotPasswordHandler(
        [FromBody] ForgotPasswordRequest request,
        IAuthService authService) {

        var response = await authService.ForgotPasswordAsync(request.Email);

        return response.Success ? Results.Ok(response) : Results.BadRequest(new { error = response.Message });
    }

    public static async Task<IResult> ValidateResetTokenHandler(
        [FromQuery] string email,
        [FromQuery] string token,
        IAuthService authService,
        IOptions<FrontendOptions> frontendOptions) {

        var response = await authService.ValidateResetTokenAsync(email, token);

        if (!response.Success) {
            var errorMessage = Uri.EscapeDataString(response.Message ?? "Invalid reset link");
            return Results.Redirect($"{frontendOptions.Value.BaseUrl}/resetPassword?error={errorMessage}");
        }

        var encodedEmail = Uri.EscapeDataString(email);
        var encodedToken = Uri.EscapeDataString(token);
        return Results.Redirect($"{frontendOptions.Value.BaseUrl}/resetPassword?email={encodedEmail}&token={encodedToken}&validated=true");
    }

    public static async Task<IResult> ResetPasswordHandler(
        [FromBody] ResetPasswordRequest request,
        IAuthService authService) {

        if (request.NewPassword != request.ConfirmPassword) {
            var errors = new Dictionary<string, string[]> {
                ["confirmPassword"] = ["Passwords do not match"]
            };
            return Results.ValidationProblem(errors);
        }

        var response = await authService.ResetPasswordAsync(
            request.Email,
            request.Token,
            request.NewPassword
        );

        if (response.Success)
            return Results.Ok(response);

        var errorDict = new Dictionary<string, string[]> {
            [""] = [response.Message ?? "Password reset failed"]
        };
        return Results.ValidationProblem(errorDict);
    }

    public static async Task<IResult> ResendEmailConfirmationHandler(
        [FromBody] ResendEmailConfirmationRequest request,
        IAuthService authService) {

        var response = await authService.ResendEmailConfirmationAsync(request.Email);

        return response.Success ? Results.Ok(response) : Results.BadRequest(new { error = response.Message });
    }

    public static async Task<IResult> ConfirmEmailHandler(
        [FromQuery] string email,
        [FromQuery] string token,
        IAuthService authService,
        IOptions<FrontendOptions> frontendOptions) {

        var response = await authService.ConfirmEmailAsync(email, token);

        if (!response.Success) {
            var errorMessage = Uri.EscapeDataString(response.Message ?? "Invalid confirmation link");
            return Results.Redirect($"{frontendOptions.Value.BaseUrl}/login?error={errorMessage}");
        }

        return Results.Redirect($"{frontendOptions.Value.BaseUrl}/login?emailConfirmed=true");
    }

#if DEBUG
    public static async Task<IResult> GenerateTestResetTokenHandler(
        [FromQuery] string email,
        UserManager<User> userManager) {

        var user = await userManager.FindByEmailAsync(email);
        if (user == null) {
            return Results.NotFound(new { error = "User not found" });
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        return Results.Ok(new { email, token });
    }

    public static async Task<IResult> SetTestTwoFactorHandler(
        [FromQuery] string email,
        [FromQuery] bool enabled,
        UserManager<User> userManager) {

        var user = await userManager.FindByEmailAsync(email);
        if (user == null) {
            return Results.NotFound(new { error = "User not found" });
        }

        await userManager.SetTwoFactorEnabledAsync(user, enabled);

        return Results.Ok(new { email, twoFactorEnabled = enabled });
    }
#endif
}