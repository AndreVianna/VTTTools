namespace GameService.Services.Game;

public class SessionService(ISessionStorage data)
    : ISessionService {
    public async Task<Session> CreateSessionAsync(string name, Guid creatorUserId, CancellationToken ct = default) {
        var session = new Session {
            Id = Guid.NewGuid(),
            Name = name,
            Owner = new() {
                Id = creatorUserId,
            },
            Players = [new Player { User = new() { Id = creatorUserId }, Type = PlayerType.Master }],
        };

        await data.AddAsync(session, ct);
        return session;
    }

    public async Task<Session?> GetSessionAsync(Guid sessionId, CancellationToken ct = default)
        => await data.GetByIdAsync(sessionId, ct);

    public Task<IEnumerable<Session>> GetUserSessionsAsync(Guid userId, CancellationToken ct = default)
        // This would be implemented with actual data retrieval in a real implementation
        // For now we're returning an empty list as a placeholder
        => Task.FromResult(Enumerable.Empty<Session>());

    public async Task UpdateSessionAsync(Guid sessionId, string name, CancellationToken ct = default) {
        var session = await data.GetByIdAsync(sessionId, ct)
            ?? throw new KeyNotFoundException("Session not found.");

        session.Name = name;
        await data.UpdateAsync(session, ct);
    }

    public async Task DeleteSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default) {
        var session = await data.GetByIdAsync(sessionId, ct)
            ?? throw new KeyNotFoundException("Session not found.");

        // Only the owner should be able to delete a session
        if (session.Owner.Id != userId)
            throw new UnauthorizedAccessException("Only the session owner can delete a session.");

        // This would call a delete method in IGameSessionStorage which needs to be added
        // await _data.DeleteAsync(sessionId, ct);
    }

    public async Task JoinSessionAsync(Guid sessionId, User user, PlayerType type = PlayerType.Player, CancellationToken ct = default) {
        var session = await data.GetByIdAsync(sessionId, ct)
            ?? throw new KeyNotFoundException("Session not found.");

        // Check if the user is already in the session
        if (session.Players.Any(p => p.User.Id == user.Id))
            return; // User is already in the session

        session.Players.Add(new() { User = user, Type = type });
        await data.UpdateAsync(session, ct);
    }

    public async Task LeaveSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default) {
        var session = await data.GetByIdAsync(sessionId, ct)
            ?? throw new KeyNotFoundException("Session not found.");

        // Owner can't leave their own session, they must delete it or transfer ownership
        if (session.Owner.Id == userId)
            throw new InvalidOperationException("Session owner cannot leave the session.");

        session.Players.RemoveWhere(p => p.User.Id == userId);
        await data.UpdateAsync(session, ct);
    }

    public async Task SetActiveMapAsync(Guid sessionId, int mapNumber, CancellationToken ct = default) {
        var session = await data.GetByIdAsync(sessionId, ct)
            ?? throw new KeyNotFoundException("Session not found.");

        if (session.Maps.All(m => m.Number != mapNumber))
            throw new KeyNotFoundException("Map not found in this session.");

        session.ActiveMap = mapNumber;
        await data.UpdateAsync(session, ct);
    }

    public async Task StartSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default) {
        var session = await data.GetByIdAsync(sessionId, ct)
            ?? throw new KeyNotFoundException("Session not found.");

        // Ensure the user has permission to start the session
        var isGameMaster = session.Owner.Id == userId ||
                           session.Players.Any(p => p.User.Id == userId && p.Type == PlayerType.Master);

        if (!isGameMaster)
            throw new UnauthorizedAccessException("Only game masters can start a session.");

        // Additional session start logic would go here
        // For now this is just a placeholder
    }
}
