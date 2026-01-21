namespace VttTools.AI.Options;

public sealed class AiOptions {
    public const string SectionName = "AI";

    public Dictionary<string, Dictionary<string, ProviderModelConfig>> Defaults { get; init; } = [];
    public Dictionary<string, ProviderConfig> Providers { get; init; } = [];
    public ResilienceConfig Resilience { get; init; } = new();
}

public sealed class ProviderModelConfig {
    public required string Provider { get; init; }
    public required string Model { get; init; }
}

public sealed class ProviderConfig {
    public required string BaseUrl { get; init; }
    public string? Health { get; init; }
    public string? ApiKey { get; init; }
}

public sealed class ResilienceConfig {
    public int MaxRetries { get; init; } = 3;
    public int AttemptTimeoutSeconds { get; init; } = 180;
    public int TotalTimeoutSeconds { get; init; } = 300;
}