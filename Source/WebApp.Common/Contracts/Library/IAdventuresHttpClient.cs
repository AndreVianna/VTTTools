namespace VttTools.WebApp.Contracts.Library;

public interface IAdventuresHttpClient {
    Task<AdventureListItem[]> GetAdventuresAsync();
    Task<AdventureDetails?> GetAdventureByIdAsync(Guid id);
    Task<Result<AdventureListItem>> CreateAdventureAsync(CreateAdventureRequest request);
    Task<Result<AdventureListItem>> CloneAdventureAsync(Guid id, CloneAdventureRequest request);
    Task<Result> UpdateAdventureAsync(Guid id, UpdateAdventureRequest request);
    Task<bool> DeleteAdventureAsync(Guid id);

    Task<SceneListItem[]> GetScenesAsync(Guid id);
    Task<Result<SceneDetails>> CreateSceneAsync(Guid id);
    Task<Result<SceneDetails>> CloneSceneAsync(Guid id, Guid templateId, CloneSceneRequest request);
    Task<string> UploadAdventureFileAsync(Guid id, Stream fileStream, string fileName);
    Task<bool> DeleteSceneAsync(Guid id, Guid sceneId);
}