namespace VttTools.Common.Model;

public class Grid {
    public Position Offset { get; set; } = new();
    public Size CellSize { get; set; } = new();
}