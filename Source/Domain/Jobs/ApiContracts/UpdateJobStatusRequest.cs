namespace VttTools.Jobs.ApiContracts;

public sealed record UpdateJobStatusRequest {
    public required JobStatus Status { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public long? ActualDurationMs { get; init; }
}
