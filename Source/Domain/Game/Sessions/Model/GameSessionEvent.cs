namespace VttTools.Game.Sessions.Model;

public class GameSessionEvent {
    public DateTimeOffset Timestamp { get; set; }
    [MaxLength(1024)]
    public string Description { get; set; } = string.Empty;
}