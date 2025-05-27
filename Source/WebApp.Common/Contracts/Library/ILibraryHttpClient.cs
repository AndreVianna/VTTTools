using VttTools.WebApp.Contracts.Library.Adventure;
using VttTools.WebApp.Contracts.Library.Scenes;

using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Contracts.Library;

public interface ILibraryHttpClient {
    Task<AdventureListItem[]> GetAdventuresAsync();
    Task<AdventureDetails?> GetAdventureByIdAsync(Guid id);
    Task<Result<AdventureListItem>> CreateAdventureAsync(CreateAdventureRequest request);
    Task<Result<AdventureListItem>> CloneAdventureAsync(Guid id, CloneAdventureRequest request);
    Task<Result> UpdateAdventureAsync(Guid id, UpdateAdventureRequest request);
    Task<bool> DeleteAdventureAsync(Guid id);

    Task<SceneListItem[]> GetScenesAsync(Guid id);
    Task<SceneDetails?> GetSceneByIdAsync(Guid id);
    Task<Result<SceneDetails>> CreateSceneAsync(Guid id);
    Task<Result<SceneDetails>> CloneSceneAsync(Guid id, Guid templateId, CloneSceneRequest request);
    Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request);
    Task<bool> DeleteSceneAsync(Guid id, Guid sceneId);

    Task<Result<SceneAssetDetails>> AddSceneAssetAsync(Guid sceneId, AddAssetRequest request);
    Task<Result> UpdateSceneAssetAsync(Guid sceneId, Guid assetId, uint number, UpdateAssetRequest request);
    Task<bool> RemoveSceneAssetAsync(Guid sceneId, Guid assetId, uint number);
}