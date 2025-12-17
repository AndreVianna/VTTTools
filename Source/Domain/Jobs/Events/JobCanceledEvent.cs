namespace VttTools.Jobs.Events;

public sealed record JobCanceledEvent {
    public string EventType { get; } = "JobCanceled";
    public required Guid JobId { get; init; }
}