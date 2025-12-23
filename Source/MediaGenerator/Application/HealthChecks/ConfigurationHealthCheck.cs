namespace VttTools.MediaGenerator.Application.HealthChecks;

public sealed class ConfigurationHealthCheck(IConfiguration configuration)
    : IHealthCheck {
    public string Name => "Configuration";
    public HealthCheckCriticality Criticality => HealthCheckCriticality.Critical;

    public async Task<HealthCheckResult> ExecuteAsync(CancellationToken ct = default) {
        var sw = Stopwatch.StartNew();
        await Task.CompletedTask;

        var appsettingsPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
        if (!File.Exists(appsettingsPath)) {
            return new(
                       Name,
                       HealthCheckStatus.Warning,
                       "appsettings.json not found",
                       $"Checked path: {appsettingsPath}",
                       "Create appsettings.json with required configuration",
                       sw.Elapsed
                      );
        }

        var providersSection = configuration.GetSection("Providers");
        var providers = providersSection.GetChildren().Select(p => p.Key).ToList();

        if (providers.Count == 0) {
            return new(
                       Name,
                       HealthCheckStatus.Fail,
                       "No providers configured",
                       "Providers section is missing or empty",
                       "Add at least one provider configuration in appsettings.json",
                       sw.Elapsed
                      );
        }

        var missingKeys = new List<string>();
        var configuredProviders = new List<string>();

        foreach (var provider in providers) {
            var apiKey = configuration[$"Providers:{provider}:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey) || IsPlaceholderValue(apiKey)) {
                missingKeys.Add(provider);
            }
            else {
                configuredProviders.Add(provider);
            }
        }

        return missingKeys.Count == providers.Count ? new(
                                                          Name,
                                                          HealthCheckStatus.Fail,
                                                          "All provider API keys missing",
                                                          $"Missing keys for: {string.Join(", ", missingKeys)}",
                                                          "Set provider API keys in appsettings.json or user secrets",
                                                          sw.Elapsed)
            : missingKeys.Count > 0 ? new(
                                          Name,
                                          HealthCheckStatus.Fail,
                                          $"Missing API keys for {missingKeys.Count} provider(s)",
                                          $"Missing: {string.Join(", ", missingKeys)}",
                                          "Set missing API keys in appsettings.json or user secrets",
                                          sw.Elapsed)
            : new HealthCheckResult(
                Name,
                HealthCheckStatus.Pass,
                "Configuration valid",
                $"Configured providers: {string.Join(", ", configuredProviders)}",
                null,
                sw.Elapsed);
    }

    private static bool IsPlaceholderValue(string value) {
        var placeholders = new[] {
            "your-",
            "placeholder",
            "enter-your",
            "insert-your",
            "add-your"
        };

        return placeholders.Any(p => value.Contains(p, StringComparison.OrdinalIgnoreCase));
    }
}