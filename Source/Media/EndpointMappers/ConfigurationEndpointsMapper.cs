namespace VttTools.Media.EndpointMappers;

public static class ConfigurationEndpointsMapper {
    public static IEndpointRouteBuilder MapConfigurationEndpoints(this IEndpointRouteBuilder app) {
        app.MapGet("/api/internal/config", ConfigurationHandlers.GetInternalConfigurationHandler)
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .WithName("GetInternalConfigurationMedia")
            .WithOpenApi();

        return app;
    }
}
