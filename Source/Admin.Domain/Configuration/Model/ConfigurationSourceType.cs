namespace VttTools.Admin.Configuration.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ConfigurationSourceType {
    JsonFile,
    EnvironmentVariable,
    CommandLine,
    UserSecrets,
    AzureKeyVault,
    AzureAppConfiguration,
    InMemory,
    FrontendEnvFile,
    Unknown,
    NotFound
}