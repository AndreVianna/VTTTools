namespace VttTools.Jobs.Services;

public sealed record JobItemContext {
    public required Guid JobId { get; init; }
    public required Guid ItemId { get; init; }
    public required int Index { get; init; }
    public string? JobInputJson { get; init; }
    public string? ItemInputJson { get; init; }
}