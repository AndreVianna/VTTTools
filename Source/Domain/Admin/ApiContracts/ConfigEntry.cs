namespace VttTools.Admin.ApiContracts;

public sealed record ConfigEntry {
    public required string Key { get; init; }
    public required string Value { get; init; }
    public required ConfigurationSource Source { get; init; }
    public string? Category { get; init; }
    public bool IsRedacted => Value == "***REDACTED***";
}
