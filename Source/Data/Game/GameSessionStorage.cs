using GameSession = VttTools.Game.Sessions.Model.GameSession;
using GameSessionEvent = VttTools.Game.Sessions.Model.GameSessionEvent;
using GameSessionMessage = VttTools.Game.Sessions.Model.GameSessionMessage;
using Participant = VttTools.Common.Model.Participant;

using GameSessionEntity = VttTools.Data.Game.Entities.GameSession;
using GameSessionEventEntity = VttTools.Data.Game.Entities.GameSessionEvent;
using GameSessionMessageEntity = VttTools.Data.Game.Entities.GameSessionMessage;
using ParticipantEntity = VttTools.Data.Game.Entities.Participant;

namespace VttTools.Data.Game;

public class GameSessionStorage(ApplicationDbContext context)
    : IGameSessionStorage {
    public Task<GameSession?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.GameSessions
            .Include(s => s.Players)
            .Include(s => s.Messages)
            .Include(s => s.Events)
            .AsNoTracking()
            .Select(s => new GameSession {
                Id = s.Id,
                OwnerId = s.OwnerId,
                Title = s.Title,
                Status = s.Status,
                EncounterId = s.EncounterId,
                Messages = s.Messages.Select(m => new GameSessionMessage {
                    SentAt = m.SentAt,
                    SentBy = m.SentBy,
                    SentTo = m.SentTo,
                    Type = m.Type,
                    Content = m.Content,
                }).ToList(),
                Events = s.Events.Select(e => new GameSessionEvent {
                    Timestamp = e.Timestamp,
                    Description = e.Description,
                }).ToList(),
                Players = s.Players.Select(p => new Participant {
                    UserId = p.UserId,
                    IsRequired = p.IsRequired,
                    Type = p.Type,
                }).ToList(),
            })
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public Task<GameSession[]> GetAllAsync(CancellationToken ct = default)
        => context.GameSessions
            .Include(s => s.Players)
            .Include(s => s.Messages)
            .Include(s => s.Events)
            .AsNoTracking()
            .Select(s => new GameSession {
                Id = s.Id,
                OwnerId = s.OwnerId,
                Title = s.Title,
                Status = s.Status,
                EncounterId = s.EncounterId,
                Messages = s.Messages.Select(m => new GameSessionMessage {
                    SentAt = m.SentAt,
                    SentBy = m.SentBy,
                    SentTo = m.SentTo,
                    Type = m.Type,
                    Content = m.Content,
                }).ToList(),
                Events = s.Events.Select(e => new GameSessionEvent {
                    Timestamp = e.Timestamp,
                    Description = e.Description,
                }).ToList(),
                Players = s.Players.Select(p => new Participant {
                    UserId = p.UserId,
                    IsRequired = p.IsRequired,
                    Type = p.Type,
                }).ToList(),
            })
            .ToArrayAsync(ct);

    public Task<GameSession[]> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => context.GameSessions
            .Include(s => s.Players)
            .Include(s => s.Messages)
            .Include(s => s.Events)
            .Where(s => s.OwnerId == userId || s.Players.Any(p => p.UserId == userId))
            .AsNoTracking()
            .Select(s => new GameSession {
                Id = s.Id,
                OwnerId = s.OwnerId,
                Title = s.Title,
                Status = s.Status,
                EncounterId = s.EncounterId,
                Messages = s.Messages.Select(m => new GameSessionMessage {
                    SentAt = m.SentAt,
                    SentBy = m.SentBy,
                    SentTo = m.SentTo,
                    Type = m.Type,
                    Content = m.Content,
                }).ToList(),
                Events = s.Events.Select(e => new GameSessionEvent {
                    Timestamp = e.Timestamp,
                    Description = e.Description,
                }).ToList(),
                Players = s.Players.Select(p => new Participant {
                    UserId = p.UserId,
                    IsRequired = p.IsRequired,
                    Type = p.Type,
                }).ToList(),
            })
            .ToArrayAsync(ct);

    public async Task<GameSession> AddAsync(GameSession session, CancellationToken ct = default) {
        var entity = new GameSessionEntity {
            Id = session.Id,
            OwnerId = session.OwnerId,
            Title = session.Title,
            Status = session.Status,
            EncounterId = session.EncounterId,
            Messages = [.. session.Messages.Select(m => new GameSessionMessageEntity {
                SentAt = m.SentAt,
                SentBy = m.SentBy,
                SentTo = m.SentTo,
                Type = m.Type,
                Content = m.Content,
            })],
            Events = [.. session.Events.Select(e => new GameSessionEventEntity {
                Timestamp = e.Timestamp,
                Description = e.Description,
            })],
            Players = [.. session.Players.Select(p => new ParticipantEntity {
                UserId = p.UserId,
                IsRequired = p.IsRequired,
                Type = p.Type,
            })],
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
        entity.EncounterId = session.EncounterId;
        entity.Messages = [.. session.Messages.Select(m => new GameSessionMessageEntity {
            SentAt = m.SentAt,
            SentBy = m.SentBy,
            SentTo = m.SentTo,
            Type = m.Type,
            Content = m.Content,
        })];
        entity.Events = [.. session.Events.Select(e => new GameSessionEventEntity {
            Timestamp = e.Timestamp,
            Description = e.Description,
        })];
        entity.Players = [.. session.Players.Select(p => new ParticipantEntity {
            UserId = p.UserId,
            IsRequired = p.IsRequired,
            Type = p.Type,
        })];
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