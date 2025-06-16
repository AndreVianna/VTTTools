using UpdateSceneAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateSceneAssetRequest;

namespace VttTools.WebApp.Contracts.Library;

public interface ISceneBuilderHttpClient {
    Task<SceneDetails?> GetSceneByIdAsync(Guid id);
    Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request);

    Task<Result<SceneAssetDetails>> AddSceneAssetAsync(Guid id, AddSceneAssetRequest request);
    Task<Result> UpdateSceneAssetAsync(Guid id, Guid assetId, uint number, UpdateSceneAssetRequest request);
    Task<bool> RemoveSceneAssetAsync(Guid id, Guid assetId, uint number);
}