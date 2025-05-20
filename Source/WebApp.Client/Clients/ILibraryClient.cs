using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Client.Clients;

public interface ILibraryClient
{
    Task<Scene?> GetSceneByIdAsync(Guid id);
    Task<Result<Scene>> UpdateSceneAsync(Guid id, UpdateSceneRequest request);
    Task<Result<SceneAsset>> AddSceneAssetAsync(Guid sceneId, AddAssetRequest request);
    Task<bool> RemoveSceneAssetAsync(Guid sceneId, Guid assetId, uint number);
    Task<Result<SceneAsset>> UpdateSceneAssetAsync(Guid sceneId, Guid assetId, uint number, UpdateAssetRequest request);
}