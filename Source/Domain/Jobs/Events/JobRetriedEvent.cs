namespace VttTools.Jobs.Events;

public sealed record JobRetriedEvent : IJobEvent {
    public string EventType { get; } = "JobRetried";
    public required Guid JobId { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}