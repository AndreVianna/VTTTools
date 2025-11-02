namespace VttTools.Admin.EndpointMappers;

public static class AdminAuthEndpointsMapper {
    public static IEndpointRouteBuilder MapAdminAuthEndpoints(this IEndpointRouteBuilder app) {
        var authGroup = app.MapGroup("/api/admin/auth");

        authGroup.MapPost("/login", AdminAuthHandlers.LoginHandler)
            .AllowAnonymous()
            .WithName("AdminLogin")
            .WithOpenApi();

        authGroup.MapPost("/logout", AdminAuthHandlers.LogoutHandler)
            .RequireAuthorization()
            .WithName("AdminLogout")
            .WithOpenApi();

        authGroup.MapGet("/me", AdminAuthHandlers.GetCurrentUserHandler)
            .RequireAuthorization()
            .WithName("GetCurrentAdminUser")
            .WithOpenApi();

        authGroup.MapGet("/session", AdminAuthHandlers.GetSessionStatusHandler)
            .RequireAuthorization()
            .WithName("GetAdminSessionStatus")
            .WithOpenApi();

        return app;
    }
}
