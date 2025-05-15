namespace VttTools.Library.Scenes.Model;

public record Grid {
    public GridType Type { get; set; }
    public Position Offset { get; set; } = new();
    public Size CellSize { get; set; } = new();
}