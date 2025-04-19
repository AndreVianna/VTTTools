namespace VttTools.Services.Chat;

public interface IChatService {
    Task<MeetingMessage> SendMessageAsync(Guid meetingId, Guid senderId, string content, CancellationToken ct = default);
    Task<IEnumerable<MeetingMessage>> GetMeetingHistoryAsync(Guid meetingId, int limit = 50, CancellationToken ct = default);
    Task<DiceRoll> RollDiceAsync(string expression, CancellationToken ct = default);
}