namespace VttTools.Library.Scenes.ApiContracts;

public record BulkDeleteSceneAssetsRequest : Request {
    public required List<uint> AssetIndices { get; init; }
}
