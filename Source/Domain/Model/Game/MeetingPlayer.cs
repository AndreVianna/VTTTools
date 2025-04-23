namespace VttTools.Model.Game;

public class MeetingPlayer {
    public Guid UserId { get; set; } = Guid.Empty;
    public PlayerType Type { get; set; }
}