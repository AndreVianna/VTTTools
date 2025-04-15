namespace VttTools.Services.Chat;

public interface IChatService {
    Task<SessionMessage> SendMessageAsync(Guid sessionId, Guid senderId, string content, CancellationToken ct = default);
    Task<IEnumerable<SessionMessage>> GetSessionHistoryAsync(Guid sessionId, int limit = 50, CancellationToken ct = default);
    Task<DiceRoll> RollDiceAsync(string expression, CancellationToken ct = default);
}
