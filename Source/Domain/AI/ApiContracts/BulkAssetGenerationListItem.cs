namespace VttTools.AI.ApiContracts;

public sealed record BulkAssetGenerationListItem {
    [Required]
    [MaxLength(128)]
    public required string Name { get; init; }

    public AssetKind Kind { get; init; } = AssetKind.Creature;

    [Required]
    [MaxLength(64)]
    public required string Category { get; init; }

    [Required]
    [MaxLength(64)]
    public required string Type { get; init; }

    [MaxLength(64)]
    public string? Subtype { get; init; }

    [MaxLength(32)]
    public string Size { get; init; } = "medium";

    [MaxLength(64)]
    public string? Environment { get; init; }

    [MaxLength(1024)]
    public string Description { get; init; } = string.Empty;

    public string[] Tags { get; init; } = [];

    public bool? GeneratePortrait { get; init; }

    public bool? GenerateToken { get; init; }
}
