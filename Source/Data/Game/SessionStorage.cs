namespace VttTools.Data.Game;

public class SessionStorage(ApplicationDbContext context)
    : ISessionStorage {
    public async Task<Session> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var session = await context.Sessions
            .Include(s => s.Owner)
            .Include(s => s.Players)
                .ThenInclude(p => p.User)
            .Include(s => s.Maps)
                .ThenInclude(m => m.Tokens)
            .Include(s => s.Messages)
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(s => s.Id == id, ct);

        return session ?? throw new KeyNotFoundException($"Session with ID {id} not found.");
    }

    public async Task<IEnumerable<Session>> GetAllAsync(CancellationToken ct = default)
        => await context.Sessions
            .Include(s => s.Owner)
            .Include(s => s.Players)
                .ThenInclude(p => p.User)
            .AsNoTrackingWithIdentityResolution()
            .ToListAsync(ct);

    public async Task<IEnumerable<Session>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await context.Sessions
            .Include(s => s.Owner)
            .Include(s => s.Players)
                .ThenInclude(p => p.User)
            .Include(s => s.Maps)
                .ThenInclude(m => m.Tokens)
            .Include(s => s.Messages)
            .Where(s => s.Owner.Id == userId || s.Players.Any(p => p.User.Id == userId))
            .AsNoTrackingWithIdentityResolution()
            .ToListAsync(ct);

    public async Task AddAsync(Session session, CancellationToken ct = default) {
        await context.Sessions.AddAsync(session, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Session session, CancellationToken ct = default) {
        // Check if the session exists
        var existingSession = await context.Sessions
            .Include(s => s.Players)
            .Include(s => s.Maps)
                .ThenInclude(m => m.Tokens)
            .Include(s => s.Messages)
            .FirstOrDefaultAsync(s => s.Id == session.Id, ct)
        ?? throw new KeyNotFoundException($"Session with ID {session.Id} not found.");

        // Detach the existing entity
        context.Entry(existingSession).State = EntityState.Detached;

        // Update with new entity
        context.Sessions.Update(session);
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default) {
        var session = await context.Sessions
            .FirstOrDefaultAsync(s => s.Id == id, ct)
        ?? throw new KeyNotFoundException($"Session with ID {id} not found.");

        context.Sessions.Remove(session);
        await context.SaveChangesAsync(ct);
    }
}