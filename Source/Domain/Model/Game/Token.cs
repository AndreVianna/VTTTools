namespace VttTools.Model.Game;

public class Token {
    public Map Map { get; set; } = null!;
    public int Number { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(256)]
    public string? ImageUrl { get; set; }
    public Position Position { get; set; } = new(0, 0);
    public Size Size { get; set; } = new(0, 0);
    public bool IsLocked { get; set; }
    public Guid? ControlledBy { get; set; }
}
