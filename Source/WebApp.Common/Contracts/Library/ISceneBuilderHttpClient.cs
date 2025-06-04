using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Contracts.Library;

public interface ISceneBuilderHttpClient {
    Task<SceneDetails?> GetSceneByIdAsync(Guid id);
    Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request);

    Task<Result<SceneAssetDetails>> AddSceneAssetAsync(Guid sceneId, AddAssetRequest request);
    Task<Result> UpdateSceneAssetAsync(Guid sceneId, Guid assetId, uint number, UpdateAssetRequest request);
    Task<bool> RemoveSceneAssetAsync(Guid sceneId, Guid assetId, uint number);
}