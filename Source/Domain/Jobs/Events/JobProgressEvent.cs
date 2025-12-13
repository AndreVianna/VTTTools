namespace VttTools.Jobs.Events;

public sealed record JobProgressEvent {
    public required Guid JobId { get; init; }
    public required string Type { get; init; }
    public required int ItemIndex { get; init; }
    public required JobItemStatus ItemStatus { get; init; }
    public required string Message { get; init; }
    public required int CurrentItem { get; init; }
    public required int TotalItems { get; init; }
}
