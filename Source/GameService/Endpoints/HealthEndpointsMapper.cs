namespace VttTools.GameService.Endpoints;

internal static class HealthEndpointsMapper {
    public static void MapHealthCheckEndpoints(this IEndpointRouteBuilder app) {
        app.MapHealthChecks("/health")
           .WithName("IsHealthy");
        app.MapHealthChecks("/alive", new() { Predicate = r => r.Tags.Contains("live") })
           .WithName("IsAlive");
    }
}