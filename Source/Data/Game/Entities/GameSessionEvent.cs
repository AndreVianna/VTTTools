namespace VttTools.Data.Game.Entities;

public class GameSessionEvent {
    public DateTimeOffset Timestamp { get; set; }
    [MaxLength(1024)]
    public string Description { get; set; } = string.Empty;
}