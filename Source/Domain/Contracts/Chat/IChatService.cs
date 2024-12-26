namespace Domain.Contracts.Chat;

public interface IChatService {
    Task<ChatMessage> SendMessageAsync(Guid sessionId, Guid senderId, string content, CancellationToken ct = default);
    Task<IEnumerable<ChatMessage>> GetSessionHistoryAsync(Guid sessionId, int limit = 50, CancellationToken ct = default);
    Task<DiceRoll> RollDiceAsync(string expression, CancellationToken ct = default);
}
