namespace VttTools.Library.Scenes.ApiContracts;

public record SceneAssetBulkUpdateRequest : Request {
    public required List<SceneAssetBulkUpdateRequestItem> Updates { get; init; }
}
