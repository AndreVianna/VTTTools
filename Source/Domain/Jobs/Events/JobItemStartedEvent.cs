namespace VttTools.Jobs.Events;

public sealed record JobItemStartedEvent : IJobItemEvent {
    public string EventType { get; } = "JobItemStarted";
    public required Guid JobId { get; init; }
    public required int Index { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}
