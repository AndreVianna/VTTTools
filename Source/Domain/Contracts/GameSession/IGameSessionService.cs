namespace Domain.Contracts.GameSession;

public interface IGameSessionService {
    Task<Model.GameSession> CreateSessionAsync(string name, Guid creatorUserId, CancellationToken ct = default);
    Task<Model.GameSession?> GetSessionAsync(Guid sessionId, CancellationToken ct = default);
    Task SetActiveMapAsync(Guid sessionId, Guid mapId, CancellationToken ct = default);
    Task StartSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default);
    Task JoinSessionAsync(Guid sessionId, Guid userId, UserGameRole role = UserGameRole.Player, CancellationToken ct = default);
    Task LeaveSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default);
}
