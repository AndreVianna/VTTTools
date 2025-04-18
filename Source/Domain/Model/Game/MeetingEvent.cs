namespace VttTools.Model.Game;

public class MeetingEvent {
    public DateTimeOffset Timestamp { get; set; }
    [MaxLength(1024)]
    public string Description { get; set; } = string.Empty;
}
