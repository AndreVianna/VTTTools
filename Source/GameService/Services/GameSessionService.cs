namespace GameService.Services;

public class GameSessionService(IGameSessionStorage data) {
    public async Task<GameSession> CreateSessionAsync(string name, Guid creatorUserId, CancellationToken ct = default) {
        var session = new GameSession {
            Id = Guid.NewGuid(),
            Name = name,
            OwnerId = creatorUserId
        };

        await data.AddAsync(session, ct);
        return session;
    }

    public async Task<GameSession?> GetSessionAsync(Guid sessionId, CancellationToken ct = default)
        => await data.GetByIdAsync(sessionId, ct);

    public async Task JoinSessionAsync(Guid sessionId, Guid userId, UserGameRole role = UserGameRole.Player, CancellationToken ct = default) {
        var session = await data.GetByIdAsync(sessionId, ct)
            ?? throw new("Session not found.");
        session.Players.Add(new() { UserId = userId, Role = role });
        await data.UpdateAsync(session, ct);
    }

    public async Task LeaveSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default) {
        var session = await data.GetByIdAsync(sessionId, ct)
            ?? throw new("Session not found.");
        session.Players.RemoveWhere(p => p.UserId == userId);
        await data.UpdateAsync(session, ct);
    }

    public async Task SetActiveMapAsync(Guid sessionId, Guid mapId, CancellationToken ct = default) {
        var session = await data.GetByIdAsync(sessionId, ct)
            ?? throw new("Session not found.");
        if (!session.Maps.Any(m => m.Id == mapId))
            throw new("Map not found in this session.");

        session = session with { ActiveMapId = mapId };
        await data.UpdateAsync(session, ct);
    }

    public Task StartSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default) => throw new NotImplementedException();
}
