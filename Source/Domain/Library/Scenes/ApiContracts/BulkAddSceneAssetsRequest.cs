namespace VttTools.Library.Scenes.ApiContracts;

public record BulkAddSceneAssetsRequest : Request {
    public required List<AddSceneAssetItem> Assets { get; init; }
}

public record AddSceneAssetItem {
    public required Guid AssetId { get; init; }
    public required Position Position { get; init; }
    public required NamedSize Size { get; init; }
    public float Rotation { get; init; }
    public float Elevation { get; init; }
    public Optional<Guid> ResourceId { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
}