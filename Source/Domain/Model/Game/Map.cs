namespace VttTools.Model.Game;

public class Map {
    public Session Session { get; set; } = null!;
    public int Number { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(256)]
    public required string ImageUrl { get; set; } = string.Empty;
    [MaxLength(256)]
    public string? MasterImageUrl { get; set; }
    public required Size? Size { get; set; }
    public required Offset? OffSet { get; set; }
    public required Cell? CellSize { get; set; }
    public List<Token> Tokens { get; set; } = [];
}
