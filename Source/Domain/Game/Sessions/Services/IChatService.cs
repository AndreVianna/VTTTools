namespace VttTools.Game.Sessions.Services;

public interface IChatService {
    Task<GameSessionMessage> SendMessageAsync(Guid sessionId, Guid senderId, string content, CancellationToken ct = default);
    Task<IEnumerable<GameSessionMessage>> GetGameSessionHistoryAsync(Guid sessionId, int limit = 50, CancellationToken ct = default);
    Task<DiceRoll> RollDiceAsync(string expression, CancellationToken ct = default);
}