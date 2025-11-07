namespace VttTools.Library.Scenes.ApiContracts;

public record SceneAssetBulkAddRequestItem
    : SceneAssetAddRequest {
    public Guid Id { get; init; }
}