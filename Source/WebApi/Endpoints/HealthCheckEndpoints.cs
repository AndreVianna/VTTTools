using static WebApi.Endpoints.HealthCheckEndpoints;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

public static class HealthCheckExtensions {
    public static IEndpointRouteBuilder MapHealthCheckEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup(HealthEndpoint)
                       .WithTags("Troubleshooting");

        app.MapHealthChecks(HealthEndpoint)
           .WithName("HealthCheck");
        app.MapHealthChecks(IsAliveEndpoint, new() { Predicate = r => r.Tags.Contains("live") })
           .WithName("IsAlive");
        return app;
    }
}
