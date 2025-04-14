namespace VttTools.Services.Chat;

public interface IChatService {
    Task<Message> SendMessageAsync(Guid sessionId, Guid senderId, string content, CancellationToken ct = default);
    Task<IEnumerable<Message>> GetSessionHistoryAsync(Guid sessionId, int limit = 50, CancellationToken ct = default);
    Task<DiceRoll> RollDiceAsync(string expression, CancellationToken ct = default);
}
