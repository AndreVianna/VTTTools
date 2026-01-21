namespace VttTools.Jobs.Events;

public sealed record JobCanceledEvent : IJobEvent {
    public string EventType { get; } = "JobCanceled";
    public required Guid JobId { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}