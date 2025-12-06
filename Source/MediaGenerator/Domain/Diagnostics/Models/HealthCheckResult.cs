namespace VttTools.MediaGenerator.Domain.Diagnostics.Models;

public sealed record HealthCheckResult(
    string CheckName,
    HealthCheckStatus Status,
    string Message,
    string? Details = null,
    string? Remediation = null,
    TimeSpan? Duration = null
);

public enum HealthCheckStatus {
    Pass,
    Warning,
    Fail,
    Skipped
}