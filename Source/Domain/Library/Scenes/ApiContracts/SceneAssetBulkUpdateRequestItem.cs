namespace VttTools.Library.Scenes.ApiContracts;

public record SceneAssetBulkUpdateRequestItem
    : SceneAssetUpdateRequest {
    public required uint Index { get; init; }
}