namespace VttTools.Admin.Dashboard.Model;

public sealed record HealthCheckResult {
    public required string Name { get; init; }
    public required string Status { get; init; }
    public required string Duration { get; init; }
    public string? Description { get; init; }
    public Dictionary<string, object>? Data { get; init; }
}