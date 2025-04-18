namespace VttTools.Model.Game;

public class MeetingMessage {
    public DateTimeOffset SentAt { get; set; }
    public int SentBy { get; set; }
    public int[] SentTo { get; set; } = [];
    public ContentType Type { get; set; }
    [MaxLength(4096)]
    public string Content { get; set; } = string.Empty;
}