namespace VttTools.WebApp.Clients;

public interface ILibraryClient {
    Task<AdventureListItem[]> GetAdventuresAsync();
    Task<AdventureInputModel?> GetAdventureByIdAsync(Guid id);
    Task<Result<AdventureListItem>> CreateAdventureAsync(CreateAdventureRequest request);
    Task<Result<AdventureListItem>> CloneAdventureAsync(Guid id, CloneAdventureRequest request);
    Task<Result> UpdateAdventureAsync(Guid id, UpdateAdventureRequest request);
    Task<bool> DeleteAdventureAsync(Guid id);
    Task<SceneListItem[]> GetScenesAsync(Guid id);
    Task<Result<Scene>> CreateSceneAsync(Guid id, AddNewSceneRequest request);
    Task<Result<Scene>> CloneSceneAsync(Guid id, AddClonedSceneRequest request);
    Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request);
    Task<bool> RemoveSceneAsync(Guid id, Guid sceneId);
}