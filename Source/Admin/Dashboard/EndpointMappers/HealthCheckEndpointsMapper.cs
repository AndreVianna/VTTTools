namespace VttTools.Admin.Dashboard.EndpointMappers;

public static class HealthCheckEndpointsMapper {
    public static IEndpointRouteBuilder MapHealthCheckEndpoints(this IEndpointRouteBuilder app) {
        var adminGroup = app.MapGroup("/api/admin/dashboard")
            .RequireAuthorization()
            .RequireRateLimiting("read");

        adminGroup.MapGet("/health-checks", HealthCheckHandlers.GetHealthChecksHandler)
            .WithName("GetHealthChecks");

        return app;
    }
}