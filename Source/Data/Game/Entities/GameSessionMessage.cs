namespace VttTools.Data.Game.Entities;

public class GameSessionMessage {
    public DateTimeOffset SentAt { get; set; }
    public Guid SentBy { get; set; }
    public Guid[] SentTo { get; set; } = [];
    public MessageType Type { get; set; }
    [MaxLength(4096)]
    public string Content { get; set; } = string.Empty;
}
