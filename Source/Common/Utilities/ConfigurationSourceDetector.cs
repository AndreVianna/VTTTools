using Microsoft.Extensions.Configuration.Json;
using VttTools.Admin.ApiContracts;

namespace VttTools.Common.Utilities;

public class ConfigurationSourceDetector(IConfigurationRoot configRoot) {
    public ConfigurationSource DetectSource(string key) {
        foreach (var provider in configRoot.Providers.Reverse()) {
            if (provider.TryGet(key, out _)) {
                var providerTypeName = provider.GetType().Name;

                return providerTypeName switch {
                    "JsonConfigurationProvider" => CreateJsonSource(provider),
                    "EnvironmentVariablesConfigurationProvider" => new ConfigurationSource {
                        Type = ConfigSourceType.EnvironmentVariable,
                        Path = null
                    },
                    "UserSecretsConfigurationProvider" => new ConfigurationSource {
                        Type = ConfigSourceType.UserSecrets,
                        Path = null
                    },
                    "CommandLineConfigurationProvider" => new ConfigurationSource {
                        Type = ConfigSourceType.CommandLine,
                        Path = null
                    },
                    "MemoryConfigurationProvider" => new ConfigurationSource {
                        Type = ConfigSourceType.InMemory,
                        Path = null
                    },
                    _ when providerTypeName.Contains("KeyVault", StringComparison.OrdinalIgnoreCase) => new ConfigurationSource {
                        Type = ConfigSourceType.AzureKeyVault,
                        Path = null
                    },
                    _ when providerTypeName.Contains("AppConfiguration", StringComparison.OrdinalIgnoreCase) => new ConfigurationSource {
                        Type = ConfigSourceType.AzureAppConfiguration,
                        Path = null
                    },
                    _ => new ConfigurationSource {
                        Type = ConfigSourceType.Unknown,
                        Path = providerTypeName
                    }
                };
            }
        }

        return new ConfigurationSource {
            Type = ConfigSourceType.NotFound,
            Path = null
        };
    }

    public static string DetermineCategory(string key) {
        var lower = key.ToLowerInvariant();
        if (lower.StartsWith("jwt") || lower.StartsWith("identity") || lower.StartsWith("auth"))
            return "Security";
        if (lower.StartsWith("connectionstrings") || lower.StartsWith("blob"))
            return "Storage";
        if (lower.StartsWith("logging"))
            return "Application";
        if (lower.StartsWith("email") || lower.StartsWith("smtp"))
            return "Email";
        return "General";
    }

    private static ConfigurationSource CreateJsonSource(IConfigurationProvider provider) {
        var path = "appsettings.json";

        if (provider is JsonConfigurationProvider json && json.Source?.Path is not null) {
            path = json.Source.Path;
        }

        return new ConfigurationSource {
            Type = ConfigSourceType.JsonFile,
            Path = path
        };
    }
}
