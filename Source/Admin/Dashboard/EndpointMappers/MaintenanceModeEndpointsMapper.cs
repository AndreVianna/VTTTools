namespace VttTools.Admin.Dashboard.EndpointMappers;

public static class MaintenanceModeEndpointsMapper {
    public static IEndpointRouteBuilder MapMaintenanceModeEndpoints(this IEndpointRouteBuilder app) {
        var maintenanceGroup = app.MapGroup("/api/admin/maintenance")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        maintenanceGroup.MapGet("", MaintenanceModeHandlers.GetMaintenanceModeStatusHandler)
            .WithName("GetMaintenanceModeStatus")
            .RequireRateLimiting("read");

        maintenanceGroup.MapPut("enable", MaintenanceModeHandlers.EnableMaintenanceModeHandler)
            .WithName("EnableMaintenanceMode")
            .RequireRateLimiting("write");

        maintenanceGroup.MapPut("disable", MaintenanceModeHandlers.DisableMaintenanceModeHandler)
            .WithName("DisableMaintenanceMode")
            .RequireRateLimiting("write");

        maintenanceGroup.MapPut("{id:guid}", MaintenanceModeHandlers.UpdateMaintenanceModeHandler)
            .WithName("UpdateMaintenanceMode")
            .RequireRateLimiting("write");

        return app;
    }
}