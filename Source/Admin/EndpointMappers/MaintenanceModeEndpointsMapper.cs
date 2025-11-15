namespace VttTools.Admin.EndpointMappers;

public static class MaintenanceModeEndpointsMapper {
    public static IEndpointRouteBuilder MapMaintenanceModeEndpoints(this IEndpointRouteBuilder app) {
        var maintenanceGroup = app.MapGroup("/api/admin/maintenance")
            .RequireAuthorization()
            .RequireRateLimiting("admin");

        maintenanceGroup.MapGet("", MaintenanceModeHandlers.GetMaintenanceModeStatusHandler)
            .WithName("GetMaintenanceModeStatus")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        maintenanceGroup.MapPut("enable", MaintenanceModeHandlers.EnableMaintenanceModeHandler)
            .WithName("EnableMaintenanceMode")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        maintenanceGroup.MapPut("disable", MaintenanceModeHandlers.DisableMaintenanceModeHandler)
            .WithName("DisableMaintenanceMode")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        maintenanceGroup.MapPut("{id:guid}", MaintenanceModeHandlers.UpdateMaintenanceModeHandler)
            .WithName("UpdateMaintenanceMode")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        return app;
    }
}
