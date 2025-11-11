
namespace VttTools.Game.Services;

public class GameSessionService(IGameSessionStorage storage)
    : IGameSessionService {
    public Task<GameSession[]> GetGameSessionsAsync(Guid userId, CancellationToken ct = default)
        => storage.GetByUserIdAsync(userId, ct);

    public Task<GameSession?> GetGameSessionByIdAsync(Guid userId, Guid sessionId, CancellationToken ct = default)
        => storage.GetByIdAsync(sessionId, ct);

    public async Task<Result<GameSession>> CreateGameSessionAsync(Guid userId, CreateGameSessionData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var session = new GameSession {
            Title = data.Title,
            OwnerId = userId,
            Players = [new Participant { UserId = userId, Type = PlayerType.Master }],
            EncounterId = data.EncounterId,
        };

        await storage.AddAsync(session, ct);
        return session;
    }

    public async Task<Result<GameSession>> UpdateGameSessionAsync(Guid userId, Guid sessionId, UpdateGameSessionData data, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return Result.Failure("Session not found");

        if (session.OwnerId != userId)
            return Result.Failure("Not authorized");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        session = session with {
            Title = data.Title.IsSet ? data.Title.Value : session.Title,
            EncounterId = data.EncounterId.IsSet ? data.EncounterId.Value : session.EncounterId,
        };

        await storage.UpdateAsync(session, ct);
        return session;
    }

    public async Task<Result> DeleteGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return Result.Failure("Session not found");

        if (session.OwnerId != userId)
            return Result.Failure("Not authorized");

        await storage.DeleteAsync(sessionId, ct);
        return Result.Success();
    }

    public async Task<Result> JoinGameSessionAsync(Guid userId, Guid sessionId, PlayerType joinAs, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return Result.Failure("Session not found");

        if (session.Players.Any(p => IsInGameSession(p, userId)))
            return Result.Success();

        session.Players.Add(new() { UserId = userId, Type = joinAs });
        await storage.UpdateAsync(session, ct);
        return Result.Success();
    }

    public async Task<Result> LeaveGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return Result.Failure("Session not found");

        session.Players.RemoveAll(p => IsInGameSession(p, userId));
        await storage.UpdateAsync(session, ct);
        return Result.Success();
    }

    public async Task<Result> SetActiveEncounterAsync(Guid userId, Guid sessionId, Guid encounterId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return Result.Failure("Session not found");

        var isGameMaster = session.Players.Any(p => IsGameSessionGameMaster(p, userId));
        if (!isGameMaster)
            return Result.Failure("Not authorized");

        session = session with { EncounterId = encounterId };
        await storage.UpdateAsync(session, ct);
        return Result.Success();
    }

    public async Task<Result> StartGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return Result.Failure("Session not found");

        var isGameMaster = session.Players.Any(p => IsGameSessionGameMaster(p, userId));
        if (!isGameMaster)
            return Result.Failure("Not authorized");

        session = session with { Status = GameSessionStatus.InProgress };
        await storage.UpdateAsync(session, ct);
        return Result.Success();
    }

    public async Task<Result> StopGameSessionAsync(Guid userId, Guid sessionId, CancellationToken ct = default) {
        var session = await storage.GetByIdAsync(sessionId, ct);
        if (session is null)
            return Result.Failure("Session not found");

        var isGameMaster = session.Players.Any(p => IsGameSessionGameMaster(p, userId));
        if (!isGameMaster)
            return Result.Failure("Not authorized");

        session = session with { Status = GameSessionStatus.Finished };
        await storage.UpdateAsync(session, ct);
        return Result.Success();
    }

    private static bool IsInGameSession(Participant player, Guid userId)
        => player.UserId == userId;
    private static bool IsGameSessionGameMaster(Participant player, Guid userId)
        => IsInGameSession(player, userId) && player.Type == PlayerType.Master;
}