namespace Domain.Services;

public interface IGameSessionService {
    Task<GameSession> CreateSessionAsync(string name, Guid creatorUserId, CancellationToken ct = default);
    Task<GameSession?> GetSessionAsync(Guid sessionId, CancellationToken ct = default);
    Task SetActiveMapAsync(Guid sessionId, Guid mapId, CancellationToken ct = default);
    Task StartSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default);
    Task JoinSessionAsync(Guid sessionId, Guid userId, PlayerRole role = PlayerRole.Player, CancellationToken ct = default);
    Task LeaveSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default);
}
