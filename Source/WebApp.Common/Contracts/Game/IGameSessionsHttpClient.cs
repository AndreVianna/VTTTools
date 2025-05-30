using VttTools.WebApp.Contracts.Game.Sessions;

namespace VttTools.WebApp.Contracts.Game;

public interface IGameSessionsHttpClient {
    Task<GameSessionListItem[]> GetGameSessionsAsync();
    Task<GameSessionDetails?> GetGameSessionByIdAsync(Guid id);
    Task<Result<GameSessionListItem>> CreateGameSessionAsync(CreateGameSessionRequest request);
    Task<Result> UpdateGameSessionAsync(Guid id, UpdateGameSessionRequest request);
    Task<bool> DeleteGameSessionAsync(Guid id);
    Task<bool> JoinGameSessionAsync(Guid id);
    Task<bool> StartGameSessionAsync(Guid id);
}