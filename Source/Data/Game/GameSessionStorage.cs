using GameSession = VttTools.Game.Sessions.Model.GameSession;
using GameSessionEntity = VttTools.Data.Game.Entities.GameSession;

namespace VttTools.Data.Game;

public class GameSessionStorage(ApplicationDbContext context)
    : IGameSessionStorage {
    public Task<GameSession?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.GameSessions
            .Include(s => s.Players)
            .Include(s => s.Messages)
            .Include(s => s.Events)
            .AsNoTrackingWithIdentityResolution()
            .Select(s => new GameSession {
                Id = s.Id,
                OwnerId = s.OwnerId,
                Title = s.Title,
                Status = s.Status,
                SceneId = s.SceneId,
                Messages = s.Messages.ToList(),
                Events = s.Events.ToList(),
                Players = s.Players.ToList(),
            })
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public Task<GameSession[]> GetAllAsync(CancellationToken ct = default)
        => context.GameSessions
            .Include(s => s.Players)
            .Include(s => s.Messages)
            .Include(s => s.Events)
            .AsNoTrackingWithIdentityResolution()
            .Select(s => new GameSession {
                Id = s.Id,
                OwnerId = s.OwnerId,
                Title = s.Title,
                Status = s.Status,
                SceneId = s.SceneId,
                Messages = s.Messages.ToList(),
                Events = s.Events.ToList(),
                Players = s.Players.ToList(),
            })
            .ToArrayAsync(ct);

    public Task<GameSession[]> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => context.GameSessions
            .Include(s => s.Players)
            .Include(s => s.Messages)
            .Include(s => s.Events)
            .Where(s => s.OwnerId == userId || s.Players.Any(p => p.UserId == userId))
            .AsNoTrackingWithIdentityResolution()
            .Select(s => new GameSession {
                Id = s.Id,
                OwnerId = s.OwnerId,
                Title = s.Title,
                Status = s.Status,
                SceneId = s.SceneId,
                Messages = s.Messages.ToList(),
                Events = s.Events.ToList(),
                Players = s.Players.ToList(),
            })
            .ToArrayAsync(ct);

    public async Task<GameSession> AddAsync(GameSession session, CancellationToken ct = default) {
        var entity = new GameSessionEntity {
            Id = session.Id,
            OwnerId = session.OwnerId,
            Title = session.Title,
            Status = session.Status,
            SceneId = session.SceneId,
            Messages = [.. session.Messages],
            Events = [.. session.Events],
            Players = [.. session.Players],
        };
        await context.GameSessions.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
        return session;
    }

    public async Task<GameSession?> UpdateAsync(GameSession session, CancellationToken ct = default) {
        var entity = await context.GameSessions.FindAsync([session.Id], ct);
        if (entity == null)
            return null;
        entity.OwnerId = session.OwnerId;
        entity.Title = session.Title;
        entity.Status = session.Status;
        entity.SceneId = session.SceneId;
        entity.Messages = [.. session.Messages];
        entity.Events = [.. session.Events];
        entity.Players = [.. session.Players];
        context.GameSessions.Update(entity);
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