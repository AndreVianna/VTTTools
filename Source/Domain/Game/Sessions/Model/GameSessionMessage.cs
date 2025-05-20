namespace VttTools.Game.Sessions.Model;

public record GameSessionMessage {
    public DateTimeOffset SentAt { get; init; }
    public Guid SentBy { get; init; }
    public Guid[] SentTo { get; init; } = [];
    public MessageType Type { get; init; }
    [MaxLength(4096)]
    public string Content { get; init; } = string.Empty;
}