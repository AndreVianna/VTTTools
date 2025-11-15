namespace VttTools.Admin.EndpointMappers;

public static class HealthCheckEndpointsMapper {
    public static IEndpointRouteBuilder MapHealthCheckEndpoints(this IEndpointRouteBuilder app) {
        var adminGroup = app.MapGroup("/api/admin/dashboard")
            .RequireAuthorization()
            .RequireRateLimiting("dashboard");

        adminGroup.MapGet("/health-checks", HealthCheckHandlers.GetHealthChecksHandler)
            .WithName("GetHealthChecks");

        return app;
    }
}
