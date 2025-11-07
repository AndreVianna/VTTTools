namespace VttTools.Library.Scenes.ApiContracts;

public record SceneAssetBulkCloneRequest : Request {
    public required List<uint> Indices { get; init; }
}