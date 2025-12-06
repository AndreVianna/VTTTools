namespace VttTools.Domain.Admin.ApiContracts;

public sealed record HealthCheckResponse {
    public required string Status { get; init; }
    public required string TotalDuration { get; init; }
    public required List<HealthCheckResult> Results { get; init; }
}

public sealed record HealthCheckResult {
    public required string Name { get; init; }
    public required string Status { get; init; }
    public required string Duration { get; init; }
    public string? Description { get; init; }
    public Dictionary<string, object>? Data { get; init; }
}