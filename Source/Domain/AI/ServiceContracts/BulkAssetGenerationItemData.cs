namespace VttTools.AI.ServiceContracts;

public sealed record BulkAssetGenerationItemData : Data {
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

    public bool GeneratePortrait { get; init; } = true;

    public bool GenerateToken { get; init; } = true;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Name is required.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Category))
            result += new Error("ContentType is required.", nameof(Category));
        if (string.IsNullOrWhiteSpace(Type))
            result += new Error("Type is required.", nameof(Type));
        return result;
    }
}
