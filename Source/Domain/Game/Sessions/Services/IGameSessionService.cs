namespace VttTools.Game.Sessions.Services;

public interface IGameSessionService {
    Task<GameSession[]> GetGameSessionsAsync(Guid userId, CancellationToken ct = default);
    Task<GameSession?> GetGameSessionByIdAsync(Guid userId, Guid sessionId, CancellationToken ct = default);
    Task<Result<GameSession>> CreateGameSessionAsync(Guid userId, CreateGameSessionData data, CancellationToken ct = default);
    Task<Result<GameSession>> UpdateGameSessionAsync(Guid userId, Guid sessionId, UpdateGameSessionData data, CancellationToken ct = default);
    Task<Result> DeleteGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);
    Task<Result> JoinGameSessionAsync(Guid userId, Guid sessionId, PlayerType joinAs, CancellationToken ct = default);
    Task<Result> LeaveGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);
    Task<Result> StartGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);
    Task<Result> StopGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default);
    Task<Result> SetActiveEncounterAsync(Guid userId, Guid sessionId, Guid encounterId, CancellationToken ct = default);
}