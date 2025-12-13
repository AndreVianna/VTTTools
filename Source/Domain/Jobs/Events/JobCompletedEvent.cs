namespace VttTools.Jobs.Events;

public sealed record JobCompletedEvent {
    public required Guid JobId { get; init; }
    public required string Type { get; init; }
    public required JobStatus Status { get; init; }
    public required int CompletedItems { get; init; }
    public required int FailedItems { get; init; }
    public required int TotalItems { get; init; }
    public required long ActualDurationMs { get; init; }
}
