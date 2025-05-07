namespace VttTools.Assets.EndpointMappers;

internal static class HealthEndpointsMapper {
    public static void MapHealthCheckEndpoints(this IEndpointRouteBuilder app) {
        app.MapHealthChecks("/health")
           .WithName("IsHealthy");
        var aliveOptions = new HealthCheckOptions {
            Predicate = RegistrationTagContainsLive,
        };
        app.MapHealthChecks("/alive", aliveOptions)
           .WithName("IsAlive");
    }

    internal static bool RegistrationTagContainsLive(HealthCheckRegistration registration)
        => registration.Tags.Contains("live");
}