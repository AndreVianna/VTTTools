namespace VttTools.Admin.EndpointMappers;

public static class DashboardEndpointsMapper {
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/api/admin/dashboard")
            .RequireRateLimiting("dashboard");

        group.MapGet("/stats", DashboardHandlers.GetDashboardStatsHandler)
            .WithName("GetDashboardStats")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .WithOpenApi();

        group.MapGet("/metrics", DashboardHandlers.GetPerformanceMetricsHandler)
            .WithName("GetPerformanceMetrics")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .WithOpenApi();

        return app;
    }
}
