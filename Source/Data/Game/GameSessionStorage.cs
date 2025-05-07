namespace VttTools.Data.Game;

public class GameSessionStorage(ApplicationDbContext context)
    : IGameSessionStorage {
    public Task<GameSession?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.GameSessions
            .Include(s => s.Players)
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public Task<GameSession[]> GetAllAsync(CancellationToken ct = default)
        => context.GameSessions
            .Include(s => s.Players)
            .AsNoTrackingWithIdentityResolution()
            .ToArrayAsync(ct);

    public Task<GameSession[]> GetByUserIdAsync(Guid userId, CancellationToken ct = default) {
        var query = context.GameSessions
                      .Include(s => s.Players)
                      .Where(s => s.OwnerId == userId || s.Players.Any(p => p.UserId == userId))
                      .AsNoTrackingWithIdentityResolution();
        return query.ToArrayAsync(ct);
    }

    public async Task<GameSession> AddAsync(GameSession session, CancellationToken ct = default) {
        await context.GameSessions.AddAsync(session, ct);
        await context.SaveChangesAsync(ct);
        return session;
    }

    public async Task<GameSession?> UpdateAsync(GameSession session, CancellationToken ct = default) {
        context.GameSessions.Update(session);
        var result = await context.SaveChangesAsync(ct);
        return result > 0 ? session : null;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var session = await context.GameSessions.FindAsync([id], ct);
        if (session == null)
            return false;
        context.GameSessions.Remove(session);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}