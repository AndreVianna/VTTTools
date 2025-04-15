namespace GameService.Services.Game;

public class SessionService(ISessionStorage storage)
    : ISessionService {
    public Task<Session[]> GetSessionsAsync(Guid userId, CancellationToken ct = default)
        => storage.GetByUserIdAsync(userId, ct);

    public Task<Session?> GetSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default)
        => storage.GetByIdAsync(sessionId, ct);

    public async Task<Result<Session>> CreateSessionAsync(Guid userId, CreateSessionData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return Result.Failure(result.Errors);

        var session = new Session {
            Name = data.Name,
            OwnerId = userId,
            Players = [new SessionPlayer { UserId = userId, Type = PlayerType.Master }],
        };

        await storage.AddAsync(session, ct);
        return session;
    }

    public async Task<TypedResult<HttpStatusCode>> UpdateSessionAsync(Guid userId, Guid sessionId, UpdateSessionData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return TypedResult.As(HttpStatusCode.BadRequest, result.Errors);

        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        if (session.OwnerId != userId)
            return TypedResult.As(HttpStatusCode.Forbidden);

        session.Name = data.Name;
        await storage.UpdateAsync(session, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> DeleteSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        if (session.OwnerId != userId)
            return TypedResult.As(HttpStatusCode.Forbidden);

        await storage.DeleteAsync(sessionId, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> JoinSessionAsync(Guid userId, Guid sessionId, PlayerType joinAs, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        if (session.Players.Any(p => p.UserId == userId))
            return TypedResult.As(HttpStatusCode.NoContent);

        session.Players.Add(new() { UserId = userId, Type = joinAs });
        await storage.UpdateAsync(session, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> LeaveSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        session.Players.RemoveWhere(p => p.UserId == userId);
        await storage.UpdateAsync(session, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> SetActiveMapAsync(Guid userId, Guid sessionId, int mapNumber, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = session.OwnerId == userId ||
                           session.Players.Any(p => p.UserId == userId && p.Type == PlayerType.Master);
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        if (session.Maps.All(m => m.Number != mapNumber))
            return TypedResult.As(HttpStatusCode.BadRequest, new Error("Map not found in this session.", nameof(mapNumber)));

        session.ActiveMap = mapNumber;
        await storage.UpdateAsync(session, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> StartSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = session.OwnerId == userId ||
                           session.Players.Any(p => p.UserId == userId && p.Type == PlayerType.Master);
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        // Additional session start logic would go here
        // For now this is just a placeholder
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> StopSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = session.OwnerId == userId ||
                           session.Players.Any(p => p.UserId == userId && p.Type == PlayerType.Master);
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        // Additional session end logic would go here
        // For now this is just a placeholder
        return TypedResult.As(HttpStatusCode.NoContent);
    }
}
