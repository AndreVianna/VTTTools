using VttTools.Admin.ApiContracts;

namespace VttTools.Common.Services;

public class FrontendConfigurationService(ILogger<FrontendConfigurationService> logger) {
    private static readonly HashSet<string> _sensitiveKeywords = [
        "password", "pass", "pwd", "passwd",
        "token", "accesstoken", "refreshtoken", "bearertoken",
        "apikey", "api_key", "key",
        "secret", "clientsecret", "apisecret",
        "connectionstring", "connstr",
        "hash"
    ];

    public async Task<IReadOnlyList<ConfigEntry>> GetFrontendConfigurationAsync(
        string appName,
        CancellationToken ct = default) {

        var envFilePath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "..",
            appName,
            ".env");

        if (!File.Exists(envFilePath)) {
            logger.LogInformation(
                "Frontend .env file not found: {FilePath}",
                envFilePath);
            return [];
        }

        logger.LogDebug("Reading frontend configuration from: {FilePath}", envFilePath);

        var lines = await File.ReadAllLinesAsync(envFilePath, ct);
        var entries = new List<ConfigEntry>();

        foreach (var line in lines) {
            var trimmedLine = line.Trim();

            if (string.IsNullOrWhiteSpace(trimmedLine) || trimmedLine.StartsWith('#')) {
                continue;
            }

            var parts = trimmedLine.Split('=', 2);
            if (parts.Length != 2) {
                continue;
            }

            var key = parts[0].Trim();
            var value = parts[1].Trim();

            var isSensitive = IsSensitiveKey(key);
            var redactedValue = isSensitive ? "***REDACTED***" : value;

            entries.Add(new ConfigEntry {
                Key = key,
                Value = redactedValue,
                Source = new ConfigurationSource {
                    Type = ConfigSourceType.FrontendEnvFile,
                    Path = $"{appName}/.env"
                },
                Category = "Frontend"
            });
        }

        logger.LogDebug(
            "Loaded {Count} configuration entries from {AppName}",
            entries.Count,
            appName);

        return entries.AsReadOnly();
    }

    private static bool IsSensitiveKey(string key) {
        var lowerKey = key.ToLowerInvariant();
        return _sensitiveKeywords.Any(keyword => lowerKey.Contains(keyword));
    }
}
