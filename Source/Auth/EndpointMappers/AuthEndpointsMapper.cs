namespace VttTools.Auth.EndpointMappers;

internal static class AuthEndpointsMapper {
    /// <summary>
    /// Maps endpoints for authentication operations.
    /// </summary>
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app) {
        var auth = app.MapGroup("/api/auth");

        // Public endpoints (no authorization required)
        auth.MapPost("/login", AuthHandlers.LoginHandler)
            .WithName("Login")
            .WithSummary("Authenticate user with email and password");

        auth.MapPost("/register", AuthHandlers.RegisterHandler)
            .WithName("Register")
            .WithSummary("Register new user account");

        auth.MapPost("/logout", AuthHandlers.LogoutHandler)
            .WithName("Logout")
            .WithSummary("Sign out current user");

        // Protected endpoints (requires authentication)
        auth.MapGet("/me", AuthHandlers.GetCurrentUserHandler)
            .RequireAuthorization()
            .WithName("GetCurrentUser")
            .WithSummary("Get current authenticated user information");

        // Password reset endpoints
        auth.MapPost("/password/forgot", AuthHandlers.ForgotPasswordHandler)
            .WithName("ForgotPassword")
            .WithSummary("Request password reset email");

        auth.MapGet("/password/reset", AuthHandlers.ValidateResetTokenHandler)
            .WithName("ValidateResetToken")
            .WithSummary("Validate reset token and redirect to frontend");

        auth.MapPut("/password/reset", AuthHandlers.ResetPasswordHandler)
            .WithName("ResetPassword")
            .WithSummary("Reset password with valid token");
    }
}