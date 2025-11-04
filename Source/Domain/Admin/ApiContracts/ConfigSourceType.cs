namespace VttTools.Admin.ApiContracts;

/// <summary>
/// Identifies the source type of a configuration value.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ConfigSourceType {
    JsonFile,
    EnvironmentVariable,
    CommandLine,
    UserSecrets,
    AzureKeyVault,
    AzureAppConfiguration,
    InMemory,
    Unknown,
    NotFound
}
