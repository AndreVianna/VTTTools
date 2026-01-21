namespace VttTools.Jobs.Events;

public sealed record JobCompletedEvent : IJobEvent {
    public string EventType { get; } = "JobCompleted";
    public required Guid JobId { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
    public string? Result { get; init; }
}