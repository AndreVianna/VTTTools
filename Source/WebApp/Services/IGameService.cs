namespace VttTools.WebApp.Services;

public interface IGameService {
    Task<Adventure[]> GetAdventuresAsync();
    Task<Result<Adventure>> CreateAdventureAsync(CreateAdventureRequest request);
    Task<Result<Adventure>> CloneAdventureAsync(Guid id, CloneAdventureRequest request);
    Task<Result> UpdateAdventureAsync(Guid id, UpdateAdventureRequest request);
    Task<bool> DeleteAdventureAsync(Guid id);
    Task<Result<Scene>> CreateSceneAsync(Guid id, CreateSceneRequest request);
    Task<Result<Scene>> CloneSceneAsync(Guid id, AddClonedSceneRequest request);
    Task<bool> RemoveSceneAsync(Guid id, Guid sceneId);

    Task<Scene[]> GetScenesAsync(Guid id);
    Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request);

    Task<Asset[]> GetAssetsAsync();
    Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request);
    Task<Result> UpdateAssetAsync(Guid id, UpdateAssetRequest request);
    Task<bool> DeleteAssetAsync(Guid id);

    Task<GameSession[]> GetGameSessionsAsync();
    Task<GameSession?> GetGameSessionByIdAsync(Guid id);
    Task<Result<GameSession>> CreateGameSessionAsync(CreateGameSessionRequest request);
    Task<Result<GameSession>> UpdateGameSessionAsync(Guid id, UpdateGameSessionRequest request);
    Task<bool> DeleteGameSessionAsync(Guid id);
    Task<bool> JoinGameSessionAsync(Guid id);
    Task<bool> StartGameSessionAsync(Guid id);
}