namespace VttTools.Media.Events;

public sealed record ResourceUpdatedEvent {
    public required Guid ResourceId { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
}