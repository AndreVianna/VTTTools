using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class HealthCheckHandlers {
    internal static async Task<IResult> GetHealthHandler(
        [FromServices] IHttpClientFactory httpClientFactory,
        [FromServices] IOptionsSnapshot<AiOptions> options,
        [FromServices] ILogger<AiProviderHealthCheck> logger,
        CancellationToken ct = default) {

        var healthCheck = new AiProviderHealthCheck(options, httpClientFactory, logger);
        var context = new HealthCheckContext();
        var result = await healthCheck.CheckHealthAsync(context, ct);

        var response = new {
            status = result.Status.ToString().ToLowerInvariant(),
            description = result.Description,
            providers = result.Data
        };

        return result.Status == HealthStatus.Healthy
            ? Results.Ok(response)
            : Results.Json(response, statusCode: 503);
    }
}