namespace VttTools.Library.Scenes.ApiContracts;

public record BulkCloneSceneAssetsRequest : Request {
    public required List<uint> AssetIndices { get; init; }
}
