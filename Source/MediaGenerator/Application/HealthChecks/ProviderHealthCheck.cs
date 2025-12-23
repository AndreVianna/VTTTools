using static System.Net.HttpStatusCode;

namespace VttTools.MediaGenerator.Application.HealthChecks;

public sealed class ProviderHealthCheck(string providerName, IHttpClientFactory httpClientFactory, IConfiguration configuration) : IHealthCheck {
    public string Name => $"{providerName} API";
    public HealthCheckCriticality Criticality => HealthCheckCriticality.Critical;

    public async Task<HealthCheckResult> ExecuteAsync(CancellationToken ct = default) {
        var sw = Stopwatch.StartNew();

        var baseUrl = configuration[$"Providers:{providerName}:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl)) {
            return new(
                       Name,
                       HealthCheckStatus.Skipped,
                       "Base url not configured",
                       null,
                       null,
                       sw.Elapsed
                      );
        }
        var healthPath = configuration[$"Providers:{providerName}:HealthPath"];
        if (string.IsNullOrWhiteSpace(healthPath)) {
            return new(
                       Name,
                       HealthCheckStatus.Skipped,
                       "Health path not configured",
                       null,
                       null,
                       sw.Elapsed
                      );
        }
        var apiKey = configuration[$"Providers:{providerName}:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey)) {
            return new(
                       Name,
                       HealthCheckStatus.Skipped,
                       "API key not configured",
                       null,
                       null,
                       sw.Elapsed
                      );
        }

        var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(5);
        client.DefaultRequestHeaders.Authorization = new("Bearer", apiKey);
        var endpoint = $"{baseUrl}{healthPath}";

        try {
            var response = await client.GetAsync(endpoint, ct);
            sw.Stop();

            return response.StatusCode switch {
                OK => new(
                          Name,
                          HealthCheckStatus.Pass,
                          $"{endpoint}: Accessible",
                          $"Response time: {sw.ElapsedMilliseconds}ms",
                          null,
                          sw.Elapsed),
                Unauthorized or Forbidden => new(
                                                 Name,
                                                 HealthCheckStatus.Fail,
                                                 $"{endpoint}: Authentication Failed",
                                                 $"Status: {(int)response.StatusCode} {response.StatusCode}",
                                                 $"Verify your {providerName} API key is valid and has appropriate permissions",
                                                 sw.Elapsed),
                _ => new(
                         Name,
                         HealthCheckStatus.Warning,
                         $"{endpoint}: Unexpected Status",
                         $"Status: {(int)response.StatusCode} {response.StatusCode}",
                         $"Check {providerName} API status at https://status.openai.com",
                         sw.Elapsed)
            };
        }
        catch (TaskCanceledException) {
            return new(
                       Name,
                       HealthCheckStatus.Warning,
                       $"{endpoint}: Request Timeout",
                       "Request exceeded 5 second timeout",
                       $"Check your network connection and {providerName} API status",
                       sw.Elapsed
                      );
        }
        catch (Exception ex) {
            return new(
                       Name,
                       HealthCheckStatus.Warning,
                       $"{endpoint}: Connectivity Error",
                       ex.Message,
                       "Check your network connection and firewall settings",
                       sw.Elapsed
                      );
        }
    }
}