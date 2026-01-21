namespace VttTools.Admin.Dashboard.EndpointMappers;

public static class DashboardEndpointsMapper {
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/api/admin/dashboard")
            .RequireRateLimiting("read");

        group.MapGet("/stats", DashboardHandlers.GetDashboardStatsHandler)
            .WithName("GetDashboardStats")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        group.MapGet("/metrics", DashboardHandlers.GetPerformanceMetricsHandler)
            .WithName("GetPerformanceMetrics")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        return app;
    }
}