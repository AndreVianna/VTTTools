namespace VttTools.EndpointMappers;

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

    /// <summary>
    /// Maps health check endpoints with detailed JSON response formatting.
    /// </summary>
    /// <param name="app">The endpoint route builder.</param>
    public static void MapDetailedHealthCheckEndpoints(this IEndpointRouteBuilder app) {
        var healthOptions = new HealthCheckOptions {
            ResponseWriter = DetailedHealthCheckResponseWriter.WriteResponse
        };
        app.MapHealthChecks("/health", healthOptions)
           .WithName("IsHealthy");

        var aliveOptions = new HealthCheckOptions {
            Predicate = RegistrationTagContainsLive,
            ResponseWriter = DetailedHealthCheckResponseWriter.WriteResponse
        };
        app.MapHealthChecks("/alive", aliveOptions)
           .WithName("IsAlive");
    }

    internal static bool RegistrationTagContainsLive(HealthCheckRegistration registration)
        => registration.Tags.Contains("live");
}