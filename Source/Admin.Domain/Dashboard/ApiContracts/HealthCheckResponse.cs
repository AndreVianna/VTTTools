namespace VttTools.Admin.Dashboard.ApiContracts;

public sealed record HealthCheckResponse {
    public required string Status { get; init; }
    public required string TotalDuration { get; init; }
    public required List<HealthCheckResult> Results { get; init; }
}