using VttTools.Common.Services;
using VttTools.Common.Utilities;

namespace VttTools.Admin.Services;

public class ConfigurationService(
    IConfiguration configuration,
    ConfigurationSourceDetector sourceDetector,
    FrontendConfigurationService frontendConfigService,
    UserManager<User> userManager) : IConfigurationService {

    public Task<ConfigurationResponse> GetServiceConfigurationAsync(string serviceName, CancellationToken ct = default) {
        return serviceName switch {
            "Admin" => GetLocalConfigurationAsync(ct),
            "Frontend" => GetFrontendConfigurationAsync(ct),
            _ => Task.FromResult(new ConfigurationResponse {
                ServiceName = serviceName,
                Entries = Array.Empty<ConfigEntry>()
            })
        };
    }

    public async Task<IReadOnlyList<ConfigurationResponse>> GetAggregatedConfigurationAsync(CancellationToken ct = default) {
        var tasks = new[] {
            GetServiceConfigurationAsync("Admin", ct),
            GetServiceConfigurationAsync("Auth", ct),
            GetServiceConfigurationAsync("Library", ct),
            GetServiceConfigurationAsync("Assets", ct),
            GetServiceConfigurationAsync("Media", ct),
            GetServiceConfigurationAsync("Game", ct),
            GetServiceConfigurationAsync("Frontend", ct)
        };

        var responses = await Task.WhenAll(tasks);
        return responses.ToList().AsReadOnly();
    }

    public async Task<string> RevealConfigValueAsync(
        Guid userId,
        string serviceName,
        string key,
        string totpCode,
        CancellationToken ct = default) {

        if (serviceName != "Admin" && serviceName != "Frontend") {
            throw new NotSupportedException($"Configuration reveal not supported for service: {serviceName}. Only 'Admin' and 'Frontend' are supported.");
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

        if (serviceName == "Frontend") {
            var appName = DetermineAppNameFromKey(key);
            if (appName != "WebAdminApp" && appName != "WebClientApp") {
                throw new ArgumentException($"Invalid application name: {appName}");
            }

            var envFilePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "..",
                appName,
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

    private async Task<ConfigurationResponse> GetLocalConfigurationAsync(CancellationToken ct = default) {
        var entries = new List<ConfigEntry>();

        if (configuration is not IConfigurationRoot configRoot) {
            throw new InvalidOperationException("Configuration root not available for source detection");
        }

        foreach (var section in configuration.AsEnumerable()) {
            if (string.IsNullOrEmpty(section.Key) || string.IsNullOrEmpty(section.Value)) {
                continue;
            }

            var source = sourceDetector.DetectSource(section.Key);
            var isSensitive = IsSensitiveKey(section.Key);
            var value = isSensitive ? "***REDACTED***" : section.Value;

            entries.Add(new ConfigEntry {
                Key = section.Key,
                Value = value,
                Source = source,
                Category = DetermineCategory(section.Key)
            });
        }

        return await Task.FromResult(new ConfigurationResponse {
            ServiceName = "Admin",
            Entries = entries.AsReadOnly()
        });
    }

    private async Task<ConfigurationResponse> GetFrontendConfigurationAsync(CancellationToken ct = default) {
        var clientConfig = await frontendConfigService.GetFrontendConfigurationAsync("WebClientApp", ct);
        var adminConfig = await frontendConfigService.GetFrontendConfigurationAsync("WebAdminApp", ct);

        var combined = clientConfig.Concat(adminConfig).ToList();

        return new ConfigurationResponse {
            ServiceName = "Frontend",
            Entries = combined.AsReadOnly()
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

        return sensitiveKeywords.Any(keyword => lowerKey.Contains(keyword));
    }

    private static string? DetermineCategory(string key) {
        var lowerKey = key.ToLowerInvariant();

        if (lowerKey.Contains("jwt") || lowerKey.Contains("token") || lowerKey.Contains("secret")) {
            return "Security";
        }

        if (lowerKey.Contains("connectionstring") || lowerKey.Contains("database") || lowerKey.Contains("storage")) {
            return "Storage";
        }

        if (lowerKey.Contains("log") || lowerKey.Contains("applicationinsights")) {
            return "Logging";
        }

        if (lowerKey.Contains("cors") || lowerKey.Contains("allowedhost")) {
            return "Security";
        }

        if (lowerKey.Contains("azure") || lowerKey.Contains("blob")) {
            return "Cloud";
        }

        if (lowerKey.StartsWith("aspnetcore_") || lowerKey.StartsWith("dotnet_")) {
            return "Runtime";
        }

        return "General";
    }

    private static string DetermineAppNameFromKey(string key) {
        var lowerKey = key.ToLowerInvariant();

        if (lowerKey.Contains("admin")) {
            return "WebAdminApp";
        }

        return "WebClientApp";
    }
}
