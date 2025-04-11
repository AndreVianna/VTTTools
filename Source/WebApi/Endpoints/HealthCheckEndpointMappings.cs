using static WebApi.Endpoints.HealthCheckEndpoints;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

public static class HealthCheckEndpointMappings {
    public static IEndpointRouteBuilder MapHealthCheckEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup(HealthCheckPrefix)
                       .WithTags("Troubleshooting");

        group.MapHealthChecks(IsHealthy)
           .WithName("IsHealthy");
        group.MapHealthChecks(IsAlive, new() { Predicate = r => r.Tags.Contains("live") })
           .WithName("IsAlive");
        return app;
    }
}
