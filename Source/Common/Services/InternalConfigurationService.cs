using VttTools.Common.Utilities;

namespace VttTools.Services;

public class InternalConfigurationService(
    IConfiguration configuration,
    ConfigurationSourceDetector sourceDetector) {
    public IReadOnlyList<object> GetConfigurationEntries() {
        var entries = new List<object>();

        foreach (var section in configuration.AsEnumerable()) {
            if (string.IsNullOrEmpty(section.Key) || string.IsNullOrEmpty(section.Value)) {
                continue;
            }

            var isSensitive = IsSensitiveKey(section.Key);
            var value = isSensitive ? "***REDACTED***" : section.Value;

            var detectedSource = sourceDetector.DetectSource(section.Key);

            entries.Add(new {
                section.Key,
                Value = value,
                Source = new {
                    Type = detectedSource.Type.ToString(),
                    detectedSource.Path
                },
                Category = ConfigurationSourceDetector.DetermineCategory(section.Key),
                IsRedacted = isSensitive
            });
        }

        return entries.AsReadOnly();
    }

    private static bool IsSensitiveKey(string key) {
        var lowerKey = key.ToLowerInvariant();
        return lowerKey.Contains("password") ||
               lowerKey.Contains("secret") ||
               lowerKey.Contains("token") ||
               lowerKey.Contains("key") ||
               lowerKey.Contains("connectionstring");
    }
}
