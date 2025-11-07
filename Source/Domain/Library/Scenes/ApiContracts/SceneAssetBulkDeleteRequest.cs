namespace VttTools.Library.Scenes.ApiContracts;

public record SceneAssetBulkDeleteRequest : Request {
    public required List<uint> Indices { get; init; }
}