namespace VttTools.Game.Services;

public class GameSessionService(IGameSessionStorage storage)
    : IGameSessionService {
    public Task<GameSession[]> GetGameSessionsAsync(Guid userId, CancellationToken ct = default)
        => storage.GetByUserIdAsync(userId, ct);

    public Task<GameSession?> GetGameSessionByIdAsync(Guid userId, Guid sessionId, CancellationToken ct = default)
        => storage.GetByIdAsync(sessionId, ct);

    public async Task<TypedResult<HttpStatusCode, GameSession>> CreateGameSessionAsync(Guid userId, CreateGameSessionData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return TypedResult.As(HttpStatusCode.BadRequest, [.. result.Errors]).WithNo<GameSession>();

        var session = new GameSession {
            Title = data.Title,
            OwnerId = userId,
            Players = [new Player { UserId = userId, Type = PlayerType.Master }],
            SceneId = data.SceneId,
        };

        await storage.AddAsync(session, ct);
        return TypedResult.As(HttpStatusCode.Created, session);
    }

    public async Task<TypedResult<HttpStatusCode, GameSession>> UpdateGameSessionAsync(Guid userId, Guid sessionId, UpdateGameSessionData data, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound).WithNo<GameSession>();

        if (session.OwnerId != userId)
            return TypedResult.As(HttpStatusCode.Forbidden).WithNo<GameSession>();

        var result = data.Validate();
        if (result.HasErrors)
            return TypedResult.As(HttpStatusCode.BadRequest, [.. result.Errors]).WithNo<GameSession>();
        session = session with {
            Title = data.Title.IsSet ? data.Title.Value : session.Title,
            SceneId = data.SceneId.IsSet ? data.SceneId.Value : session.SceneId,
        };

        await storage.UpdateAsync(session, ct);
        return TypedResult.As(HttpStatusCode.OK, session);
    }

    public async Task<TypedResult<HttpStatusCode>> DeleteGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        if (session.OwnerId != userId)
            return TypedResult.As(HttpStatusCode.Forbidden);

        await storage.DeleteAsync(sessionId, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> JoinGameSessionAsync(Guid userId, Guid sessionId, PlayerType joinAs, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        if (session.Players.Any(p => IsInGameSession(p, userId)))
            return TypedResult.As(HttpStatusCode.NoContent);

        session.Players.Add(new() { UserId = userId, Type = joinAs });
        await storage.UpdateAsync(session, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> LeaveGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        session.Players.RemoveAll(p => IsInGameSession(p, userId));
        await storage.UpdateAsync(session, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> SetActiveSceneAsync(Guid userId, Guid sessionId, Guid sceneId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = session.Players.Any(p => IsGameSessionGameMaster(p, userId));
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        session = session with { SceneId = sceneId };
        await storage.UpdateAsync(session, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> StartGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = session.Players.Any(p => IsGameSessionGameMaster(p, userId));
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        session = session with { Status = GameSessionStatus.InProgress };
        await storage.UpdateAsync(session, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> StopGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = session.Players.Any(p => IsGameSessionGameMaster(p, userId));
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        session = session with { Status = GameSessionStatus.Finished };
        await storage.UpdateAsync(session, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    private static bool IsInGameSession(Player player, Guid userId)
        => player.UserId == userId;
    private static bool IsGameSessionGameMaster(Player player, Guid userId)
        => IsInGameSession(player, userId) && player.Type == PlayerType.Master;
}