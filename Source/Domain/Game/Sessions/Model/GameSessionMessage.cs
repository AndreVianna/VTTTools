namespace VttTools.Game.Sessions.Model;

public record GameSessionMessage {
    public DateTimeOffset SentAt { get; init; }
    public Guid SentBy { get; init; }
    public Guid[] SentTo { get; init; } = [];
    public MessageType Type { get; init; }
    public string Content { get; init; } = string.Empty;
}