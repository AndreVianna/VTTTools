namespace VttTools.Model.Game;

public class Grid {
    public Position Offset { get; set; } = new();
    public Size CellSize { get; set; } = new();
}