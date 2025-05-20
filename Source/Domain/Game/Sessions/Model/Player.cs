namespace VttTools.Game.Sessions.Model;

public record Player {
    public Guid UserId { get; init; } = Guid.Empty;
    public PlayerType Type { get; init; }
}