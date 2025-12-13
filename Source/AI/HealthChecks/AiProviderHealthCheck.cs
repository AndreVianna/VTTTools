namespace VttTools.AI.HealthChecks;

public class AiProviderHealthCheck(
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory,
    ILogger<AiProviderHealthCheck> logger)
    : IHealthCheck {

    private static readonly string[] _availableProviders = [
        "OpenAI",
        "Stability",
        "Google",
        "ElevenLabs",
        "Suno",
        "RunwayML",
    ];

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default) {

        var results = new Dictionary<string, object>();
        var overallHealthy = true;

        foreach (var providerName in _availableProviders) {
            var baseUrl = configuration[$"AI:Providers:{providerName}:BaseUrl"];
            var apiKey = configuration[$"AI:Providers:{providerName}:ApiKey"];
            var healthEndpoint = configuration[$"AI:Providers:{providerName}:Health"];

            if (string.IsNullOrEmpty(baseUrl)) {
                results[$"{providerName}_status"] = "not_configured";
                continue;
            }

            if (string.IsNullOrEmpty(apiKey)) {
                results[$"{providerName}_status"] = "missing_api_key";
                overallHealthy = false;
                continue;
            }

            try {
                var status = await CheckProviderAsync(providerName, baseUrl, apiKey, healthEndpoint, cancellationToken);
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
        string provider,
        string baseUrl,
        string apiKey,
        string? healthEndpoint,
        CancellationToken ct) {

        if (string.IsNullOrEmpty(healthEndpoint)) {
            return "healthy";
        }

        using var client = httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(baseUrl);
        client.Timeout = TimeSpan.FromSeconds(5);

        if (provider == "Google") {
            client.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);
        }
        else {
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", apiKey);
        }

        var response = await client.GetAsync(healthEndpoint, ct);
        return response.IsSuccessStatusCode ? "healthy" : $"unhealthy_{(int)response.StatusCode}";
    }
}
