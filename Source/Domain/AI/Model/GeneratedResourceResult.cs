namespace VttTools.AI.Model;

public sealed record GeneratedResourceResult {
    public required string AssetName { get; init; }
    public required string GenerationType { get; init; }
    public required Guid ResourceId { get; init; }
    public required string Kind { get; init; }
    public string? Category { get; init; }
    public string? Type { get; init; }
    public string? Subtype { get; init; }
    public string? Description { get; init; }
    public string[] Tags { get; init; } = [];
}