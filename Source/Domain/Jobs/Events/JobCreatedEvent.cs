namespace VttTools.Jobs.Events;

public sealed record JobCreatedEvent
    : IJobEvent {
    public string EventType { get; } = "JobCreated";
    public required Guid JobId { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
    public required string Type { get; init; }
    public TimeSpan? EstimatedDuration { get; init; }
    public int TotalItems { get; init; }
}