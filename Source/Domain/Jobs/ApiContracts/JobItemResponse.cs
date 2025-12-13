namespace VttTools.Jobs.ApiContracts;

public sealed record JobItemResponse {
    public required Guid ItemId { get; init; }
    public required Guid JobId { get; init; }
    public required int Index { get; init; }
    public required JobItemStatus Status { get; init; }
    public string? InputJson { get; init; }
    public string? OutputJson { get; init; }
    public string? ErrorMessage { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}
