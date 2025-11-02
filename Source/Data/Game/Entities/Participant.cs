namespace VttTools.Data.Game.Entities;

public class Participant {
    public Guid UserId { get; set; }
    public bool IsRequired { get; set; }
    public PlayerType Type { get; set; }
}
