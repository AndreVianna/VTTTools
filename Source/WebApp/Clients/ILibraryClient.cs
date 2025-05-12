namespace VttTools.WebApp.Clients;

public interface ILibraryClient {
    Task<AdventureListItem[]> GetAdventuresAsync();
    Task<AdventureInputModel?> GetAdventureByIdAsync(Guid id);
    Task<Result<AdventureListItem>> CreateAdventureAsync(CreateAdventureRequest request);
    Task<Result<AdventureListItem>> CloneAdventureAsync(Guid id, CloneAdventureRequest request);
    Task<Result> UpdateAdventureAsync(Guid id, UpdateAdventureRequest request);
    Task<bool> DeleteAdventureAsync(Guid id);
    Task<Result<Scene>> CreateSceneAsync(Guid id, CreateSceneRequest request);
    Task<Result<Scene>> CloneSceneAsync(Guid id, AddClonedSceneRequest request);
    Task<bool> RemoveSceneAsync(Guid id, Guid sceneId);

    Task<Scene[]> GetScenesAsync(Guid id);
    Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request);
}