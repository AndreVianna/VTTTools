namespace VttTools.Jobs.Events;

public sealed record JobItemStartedEvent {
    public string EventType { get; } = "JobItemStarted";
    public required Guid JobId { get; init; }
    public required int Index { get; init; }
    public DateTime? StartedAt { get; init; }
}