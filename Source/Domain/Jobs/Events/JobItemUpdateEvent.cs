namespace VttTools.Jobs.Events;

public sealed record JobItemUpdateEvent {
    public required Guid JobId { get; init; }
    public required int Index { get; init; }
    public required JobItemStatus Status { get; init; }
    public string? Message { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}
