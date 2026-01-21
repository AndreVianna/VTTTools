namespace VttTools.AI.Model;

public sealed record JobItemContext {
    public required Guid JobId { get; init; }
    public required int Index { get; init; }
    public string Data { get; init; } = string.Empty;
}