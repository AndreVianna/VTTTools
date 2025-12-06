namespace VttTools.Game.Sessions.Model;

public record GameSessionEvent {
    public DateTimeOffset Timestamp { get; init; }
    [MaxLength(1024)]
    public string Description { get; init; } = string.Empty;
}