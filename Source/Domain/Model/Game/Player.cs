namespace VttTools.Model.Game;

public class Player {
    public Session Session { get; set; } = null!;
    public User User { get; set; } = null!;
    public PlayerType Type { get; set; }
}
