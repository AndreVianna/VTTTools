namespace VttTools.Media.Ingest;

/// <summary>
/// Data for a single asset to be ingested with AI-generated images.
/// </summary>
public sealed record IngestItemData {
    /// <summary>
    /// The Asset ID to generate images for.
    /// </summary>
    public required Guid AssetId { get; init; }

    /// <summary>
    /// The name of the asset (used for prompt building).
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// The asset kind (Character, Creature, Item, etc.).
    /// </summary>
    public required AssetKind Kind { get; init; }

    /// <summary>
    /// The asset category (e.g., "humanoid", "beast").
    /// </summary>
    public string? Category { get; init; }

    /// <summary>
    /// The asset type (e.g., "elf", "dragon").
    /// </summary>
    public string? Type { get; init; }

    /// <summary>
    /// The asset subtype (e.g., "high elf", "red dragon").
    /// </summary>
    public string? Subtype { get; init; }

    /// <summary>
    /// Description to include in the prompt.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Environment context for the image.
    /// </summary>
    public string? Environment { get; init; }

    /// <summary>
    /// Tags for the asset.
    /// </summary>
    public string[] Tags { get; init; } = [];

    /// <summary>
    /// Whether to generate a portrait image.
    /// </summary>
    public bool GeneratePortrait { get; init; } = true;

    /// <summary>
    /// Whether to generate a token image.
    /// </summary>
    public bool GenerateToken { get; init; } = true;

    /// <summary>
    /// Optional prompt template ID to use.
    /// </summary>
    public Guid? TemplateId { get; init; }
}
