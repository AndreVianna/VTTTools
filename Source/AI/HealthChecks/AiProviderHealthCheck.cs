namespace VttTools.AI.HealthChecks;

public class AiProviderHealthCheck(
    IOptionsSnapshot<AiOptions> options,
    IHttpClientFactory httpClientFactory,
    ILogger<AiProviderHealthCheck> logger)
    : IHealthCheck {

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default) {

        var results = new Dictionary<string, object>();
        var overallHealthy = true;
        var providers = options.Value.Providers;

        foreach ((var providerName, var config) in providers) {
            if (string.IsNullOrEmpty(config.ApiKey)) {
                results[$"{providerName}_status"] = "missing_api_key";
                overallHealthy = false;
                continue;
            }

            try {
                var status = await CheckProviderAsync(providerName, config, cancellationToken);
                results[$"{providerName}_status"] = status;
                if (status != "healthy")
                    overallHealthy = false;
            }
            catch (Exception ex) {
                logger.LogWarning(ex, "Health check failed for provider {Provider}", providerName);
                results[$"{providerName}_status"] = "error";
                results[$"{providerName}_error"] = ex.Message;
                overallHealthy = false;
            }
        }

        return overallHealthy
            ? HealthCheckResult.Healthy("All configured AI providers are healthy", results)
            : HealthCheckResult.Degraded("Some AI providers are not healthy", data: results);
    }

    private async Task<string> CheckProviderAsync(
        string providerName,
        ProviderConfig config,
        CancellationToken ct) {

        if (string.IsNullOrEmpty(config.Health))
            return "healthy";

        using var client = httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(config.BaseUrl);
        client.Timeout = TimeSpan.FromSeconds(5);

        if (providerName == "Google") {
            client.DefaultRequestHeaders.Add("x-goog-api-key", config.ApiKey);
        }
        else {
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", config.ApiKey);
        }

        var response = await client.GetAsync(config.Health, ct);
        return response.IsSuccessStatusCode ? "healthy" : $"unhealthy_{(int)response.StatusCode}";
    }
}