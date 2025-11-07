namespace VttTools.Library.Scenes.ApiContracts;

public record SceneAssetBulkAddRequest : Request {
    public required List<SceneAssetBulkAddRequestItem> Assets { get; init; }
}
