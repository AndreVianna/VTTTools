namespace VttTools.Jobs.Events;

public sealed record JobItemCompletedEvent : IJobItemEvent {
    public string EventType { get; } = "JobItemCompleted";
    public required Guid JobId { get; init; }
    public required int Index { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
    public required JobItemStatus Status { get; init; }
    public string? Result { get; init; }
}
