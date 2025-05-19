using VttTools.Library.Adventures.ApiContracts;
using VttTools.Library.Scenes.ApiContracts;
using VttTools.Library.Scenes.Model;
using VttTools.WebApp.Client.Models;

namespace VttTools.WebApp.Client.Clients;

public interface ILibraryClient
{
    Task<Scene?> GetSceneByIdAsync(Guid id);
    Task<Result<Scene>> UpdateSceneAsync(Guid id, UpdateSceneRequest request);
    Task<Result<SceneAsset>> AddSceneAssetAsync(Guid sceneId, AddNewSceneAssetRequest request);
    Task<bool> RemoveSceneAssetAsync(Guid sceneId, Guid assetId, uint number);
    Task<Result<SceneAsset>> UpdateSceneAssetAsync(Guid sceneId, Guid assetId, uint number, UpdateSceneAssetRequest request);
}