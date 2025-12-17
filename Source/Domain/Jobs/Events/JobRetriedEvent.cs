namespace VttTools.Jobs.Events;

public sealed record JobRetriedEvent {
    public string EventType { get; } = "JobRetried";
    public required Guid JobId { get; init; }
}
