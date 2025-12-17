namespace VttTools.Jobs.Events;

public sealed record JobCreatedEvent {
    public string EventType { get; } = "JobCreated";
    public required Guid JobId { get; init; }
    public required string Type { get; init; }
    public TimeSpan? EstimatedDuration { get; init; }
    public int TotalItems { get; init; }
}
