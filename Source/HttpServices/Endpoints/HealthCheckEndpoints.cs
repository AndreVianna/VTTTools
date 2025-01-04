using IResult = Microsoft.AspNetCore.Http.IResult;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

public static class HealthCheckEndpoints {
    public static IEndpointRouteBuilder MapHealthCheckEndpoints(this IEndpointRouteBuilder app) {
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new() { Predicate = r => r.Tags.Contains("live") });
        return app;
    }
}
