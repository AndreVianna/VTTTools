using VttTools.Common.Services;
using VttTools.Common.Utilities;

namespace VttTools.Admin.Services;

public class ConfigurationService(
    IConfiguration configuration,
    ConfigurationSourceDetector sourceDetector,
    FrontendConfigurationService frontendConfigService,
    UserManager<User> userManager,
    ILogger<ConfigurationService> logger) : IConfigurationService {

    public async Task<ConfigurationResponse> GetServiceConfigurationAsync(string serviceName, CancellationToken ct = default)
        => serviceName switch {
            "Admin" => await GetLocalConfigurationAsync(ct),
            "WebClientApp" => await GetFrontendConfigurationAsync("WebClientApp", ct),
            "WebAdminApp" => await GetFrontendConfigurationAsync("WebAdminApp", ct),
            _ => throw new NotSupportedException($"Service '{serviceName}' is not supported by Admin API. Use direct service calls.")
        };


    public async Task<string> RevealConfigValueAsync(
        Guid userId,
        string serviceName,
        string key,
        string totpCode,
        CancellationToken ct = default) {

        if (serviceName != "Admin" && serviceName != "WebClientApp" && serviceName != "WebAdminApp") {
            throw new NotSupportedException($"Configuration reveal not supported for service: {serviceName}. Only 'Admin', 'WebClientApp', and 'WebAdminApp' are supported.");
        }

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null || !user.TwoFactorEnabled) {
            throw new UnauthorizedAccessException("2FA not enabled");
        }

        var isValid = await userManager.VerifyTwoFactorTokenAsync(user, "Authenticator", totpCode);
        if (!isValid) {
            throw new UnauthorizedAccessException("Invalid 2FA code");
        }

        var config = await GetServiceConfigurationAsync(serviceName, ct);

        var entry = config.Entries.FirstOrDefault(e => e.Key == key);
        if (entry is null) {
            throw new KeyNotFoundException($"Configuration key '{key}' not found");
        }

        if (!entry.IsRedacted) {
            return entry.Value;
        }

        if (serviceName == "Admin") {
            return configuration[key] ?? "[Configuration value not available]";
        }

        if (serviceName == "WebClientApp" || serviceName == "WebAdminApp") {
            var envFilePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "..",
                serviceName,
                ".env");

            if (File.Exists(envFilePath)) {
                var lines = await File.ReadAllLinesAsync(envFilePath, ct);
                foreach (var line in lines) {
                    var trimmedLine = line.Trim();
                    if (string.IsNullOrWhiteSpace(trimmedLine) || trimmedLine.StartsWith('#')) {
                        continue;
                    }

                    var parts = trimmedLine.Split('=', 2);
                    if (parts.Length == 2 && parts[0].Trim() == key) {
                        return parts[1].Trim();
                    }
                }
            }
        }

        return "[Configuration value not available]";
    }

    private Task<ConfigurationResponse> GetLocalConfigurationAsync(CancellationToken ct = default) {
        var entries = new List<ConfigEntry>();

        if (configuration is not IConfigurationRoot configRoot) {
            throw new InvalidOperationException("Configuration root not available for source detection");
        }

        var allConfig = configuration.AsEnumerable().ToList();
        logger.LogInformation("GetLocalConfigurationAsync: Total config items from AsEnumerable: {Count}", allConfig.Count);

        var validCount = 0;
        var skippedNullKey = 0;
        var skippedNullValue = 0;

        foreach (var section in allConfig) {
            if (string.IsNullOrEmpty(section.Key)) {
                skippedNullKey++;
                continue;
            }

            if (string.IsNullOrEmpty(section.Value)) {
                skippedNullValue++;
                continue;
            }

            validCount++;

            var source = sourceDetector.DetectSource(section.Key);
            var isSensitive = IsSensitiveKey(section.Key);
            var value = isSensitive ? "***REDACTED***" : section.Value;

            entries.Add(new ConfigEntry {
                Key = section.Key,
                Value = value,
                Source = source,
                Category = ConfigurationSourceDetector.DetermineCategory(section.Key)
            });
        }

        logger.LogInformation(
            "GetLocalConfigurationAsync: Valid entries={ValidCount}, SkippedNullKey={NullKey}, SkippedNullValue={NullValue}, Final entries count={EntriesCount}",
            validCount, skippedNullKey, skippedNullValue, entries.Count);

        return Task.FromResult(new ConfigurationResponse {
            ServiceName = "Admin",
            Entries = entries.AsReadOnly()
        });
    }

    private async Task<ConfigurationResponse> GetFrontendConfigurationAsync(string appName, CancellationToken ct = default) {
        var entries = await frontendConfigService.GetFrontendConfigurationAsync(appName, ct);

        return new ConfigurationResponse {
            ServiceName = appName,
            Entries = entries
        };
    }


    private static bool IsSensitiveKey(string key) {
        var lowerKey = key.ToLowerInvariant();
        var sensitiveKeywords = new[] {
            "password", "pass", "pwd", "passwd",
            "token", "accesstoken", "refreshtoken", "bearertoken",
            "apikey", "api_key", "key",
            "secret", "clientsecret", "apisecret",
            "connectionstring", "connstr",
            "hash"
        };

        return sensitiveKeywords.Any(lowerKey.Contains);
    }
}
