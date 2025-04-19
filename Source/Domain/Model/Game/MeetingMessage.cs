namespace VttTools.Model.Game;

public class MeetingMessage {
    public DateTimeOffset SentAt { get; set; }
    public Guid SentBy { get; set; }
    public Guid[] SentTo { get; set; } = [];
    public MessageType Type { get; set; }
    [MaxLength(4096)]
    public string Content { get; set; } = string.Empty;
}