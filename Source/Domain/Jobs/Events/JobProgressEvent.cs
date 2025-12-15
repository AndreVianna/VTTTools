namespace VttTools.Jobs.Events;

public sealed record JobProgressEvent {
    public required Guid JobId { get; init; }
    public required string Type { get; init; }
    public required JobStatus Status { get; init; }
    public int TotalItems { get; init; }
    public DateTime? StartedAt { get; init; }
}
