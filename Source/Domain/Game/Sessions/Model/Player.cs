namespace VttTools.Game.Sessions.Model;

public class Player {
    public Guid UserId { get; set; } = Guid.Empty;
    public PlayerType Type { get; set; }
}