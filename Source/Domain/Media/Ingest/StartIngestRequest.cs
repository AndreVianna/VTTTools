namespace VttTools.Media.Ingest;

/// <summary>
/// HTTP request for starting an ingest job.
/// </summary>
public sealed record StartIngestRequest : Request {
    /// <summary>
    /// Items to process in the ingest job.
    /// </summary>
    public required IReadOnlyList<IngestItemRequest> Items { get; init; }
}

/// <summary>
/// Single item in an ingest request.
/// </summary>
public sealed record IngestItemRequest {
    /// <summary>
    /// The Asset ID to generate images for.
    /// </summary>
    public required Guid AssetId { get; init; }

    /// <summary>
    /// The name of the asset.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// The asset kind.
    /// </summary>
    public required AssetKind Kind { get; init; }

    /// <summary>
    /// The asset category.
    /// </summary>
    public string? Category { get; init; }

    /// <summary>
    /// The asset type.
    /// </summary>
    public string? Type { get; init; }

    /// <summary>
    /// The asset subtype.
    /// </summary>
    public string? Subtype { get; init; }

    /// <summary>
    /// Description for the AI prompt.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Environment context.
    /// </summary>
    public string? Environment { get; init; }

    /// <summary>
    /// Tags for the asset.
    /// </summary>
    public string[] Tags { get; init; } = [];

    /// <summary>
    /// Whether to generate a portrait.
    /// </summary>
    public bool GeneratePortrait { get; init; } = true;

    /// <summary>
    /// Whether to generate a token.
    /// </summary>
    public bool GenerateToken { get; init; } = true;

    /// <summary>
    /// Optional prompt template ID.
    /// </summary>
    public Guid? TemplateId { get; init; }
}
