namespace VttTools.Model.Game;

public class SessionMapToken {
    public int Number { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(256)]
    public string? ImageUrl { get; set; }
    public Position Position { get; set; } = new();
    public Size Size { get; set; } = new();
    public bool IsLocked { get; set; }
    public int? ControlledBy { get; set; }
}
