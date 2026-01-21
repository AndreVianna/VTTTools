namespace VttTools.Admin.Auth.EndpointMappers;

public static class AdminAuthEndpointsMapper {
    public static IEndpointRouteBuilder MapAdminAuthEndpoints(this IEndpointRouteBuilder app) {
        var authGroup = app.MapGroup("/api/admin/auth");

        authGroup.MapPost("/login", AdminAuthHandlers.LoginHandler)
            .AllowAnonymous()
            .WithName("AdminLogin");

        authGroup.MapPost("/logout", AdminAuthHandlers.LogoutHandler)
            .RequireAuthorization()
            .WithName("AdminLogout");

        authGroup.MapGet("/me", AdminAuthHandlers.GetCurrentUserHandler)
            .RequireAuthorization()
            .WithName("GetCurrentAdminUser");

        authGroup.MapGet("/session", AdminAuthHandlers.GetSessionStatusHandler)
            .RequireAuthorization()
            .WithName("GetAdminSessionStatus");

        return app;
    }
}