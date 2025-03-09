using static HttpServices.HealthCheckEndpoints;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

public static class HealthCheckEndpoints {
    public static IEndpointRouteBuilder MapHealthCheckEndpoints(this IEndpointRouteBuilder app) {
        app.MapHealthChecks(HealthEndpoint);
        app.MapHealthChecks(IsAliveEndpoint, new() { Predicate = r => r.Tags.Contains("live") });
        return app;
    }
}
