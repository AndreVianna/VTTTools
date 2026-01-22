namespace VttTools.Admin.Ingest.ApiContracts;

public sealed record IngestAssetsRequest {
    public required IReadOnlyList<IngestAssetItem> Items { get; init; }
}

public sealed record IngestAssetItem {
    public required string Name { get; init; }
    public AssetKind Kind { get; init; } = AssetKind.Creature;
    public required string Category { get; init; }
    public required string Type { get; init; }
    public string? Subtype { get; init; }
    public string Size { get; init; } = "medium";
    public string? Environment { get; init; }
    public string Description { get; init; } = string.Empty;
    public string[] Tags { get; init; } = [];
}
