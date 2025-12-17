namespace VttTools.Jobs.Events;

public sealed record JobCompletedEvent {
    public string EventType { get; } = "JobCompleted";
    public required Guid JobId { get; init; }
}