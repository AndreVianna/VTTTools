namespace VttTools.Admin.Configuration.Model;

/// <summary>
/// Represents the source of a configuration value.
/// </summary>
public sealed record ConfigurationSource {
    public required ConfigurationSourceType Type { get; init; }
    public string? Path { get; init; }
}