namespace VttTools.Admin.Configuration.EndpointMappers;

public static class ConfigurationEndpointsMapper {
    public static IEndpointRouteBuilder MapConfigurationEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/api/admin/configuration")
            .RequireAuthorization()
            .RequireRateLimiting("read");

        group.MapGet("/{serviceName}", ConfigurationHandlers.GetConfigurationHandler)
            .WithName("GetConfiguration")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        group.MapPost("/reveal", ConfigurationHandlers.RevealConfigValueHandler)
            .WithName("RevealConfigValue")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .RequireRateLimiting("sensitive");

        return app;
    }
}