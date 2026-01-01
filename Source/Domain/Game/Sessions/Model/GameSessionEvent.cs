namespace VttTools.Game.Sessions.Model;

public record GameSessionEvent {
    public DateTimeOffset Timestamp { get; init; }
    public string Description { get; init; } = string.Empty;
}