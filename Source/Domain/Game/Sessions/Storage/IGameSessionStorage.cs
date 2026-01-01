namespace VttTools.Game.Sessions.Storage;

public interface IGameSessionStorage {
    Task<GameSession?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<GameSession[]> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<GameSession> AddAsync(GameSession session, CancellationToken ct = default);
    Task<GameSession?> UpdateAsync(GameSession session, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}