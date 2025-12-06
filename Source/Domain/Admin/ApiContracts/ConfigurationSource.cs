namespace VttTools.Admin.ApiContracts;

/// <summary>
/// Represents the source of a configuration value.
/// </summary>
public sealed record ConfigurationSource {
    public required ConfigSourceType Type { get; init; }
    public string? Path { get; init; }
}