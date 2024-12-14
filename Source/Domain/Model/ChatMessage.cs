namespace Domain.Model;

public record ChatMessage {
    public required Guid Id { get; init; }
    public required Guid SessionId { get; init; }
    public required Guid SentBy { get; init; }
    public Guid? SentTo { get; init; } // in case of a "whisper"
    public required DateTimeOffset SentAt { get; init; }
    public string Message { get; init; } = string.Empty;
}
