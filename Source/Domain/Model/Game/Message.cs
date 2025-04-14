namespace VttTools.Model.Game;

public class Message {
    public Session Session { get; set; } = null!;
    public DateTimeOffset SentAt { get; set; }
    public int SentBy { get; set; }
    public int? SentTo { get; set; } // in case of a "whisper"
    [MaxLength(4096)]
    public string Content { get; set; } = string.Empty;
}
