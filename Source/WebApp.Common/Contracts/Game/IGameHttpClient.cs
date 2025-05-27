namespace VttTools.WebApp.Contracts.Game;

public interface IGameHttpClient {
    Task<GameSession[]> GetGameSessionsAsync();
    Task<GameSession?> GetGameSessionByIdAsync(Guid id);
    Task<Result<GameSession>> CreateGameSessionAsync(CreateGameSessionRequest request);
    Task<Result<GameSession>> UpdateGameSessionAsync(Guid id, UpdateGameSessionRequest request);
    Task<bool> DeleteGameSessionAsync(Guid id);
    Task<bool> JoinGameSessionAsync(Guid id);
    Task<bool> StartGameSessionAsync(Guid id);
}