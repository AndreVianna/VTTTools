namespace VttTools.Library.Scenes.ApiContracts;

public record BulkUpdateSceneAssetsRequest : Request {
    public required List<SceneAssetUpdate> Updates { get; init; }
}

public record SceneAssetUpdate {
    public required uint Index { get; init; }
    public Optional<Position> Position { get; init; }
    public Optional<NamedSize> Size { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
}
