namespace VttTools.Common.Model;

/// <summary>
/// Represents a cell-based position on the game grid (integer coordinates)
/// Used for placing assets on the scene in discrete grid cells
/// </summary>
public record Position {
    /// <summary>
    /// Horizontal position (cell column index)
    /// </summary>
    public int X { get; init; }

    /// <summary>
    /// Vertical position (cell row index)
    /// </summary>
    public int Y { get; init; }

    /// <summary>
    /// Creates a new Position with the specified coordinates
    /// </summary>
    public Position(int x, int y) {
        X = x;
        Y = y;
    }

    /// <summary>
    /// Origin position at (0, 0)
    /// </summary>
    public static Position Zero => new(0, 0);

    /// <summary>
    /// Returns a string representation of the position
    /// </summary>
    public override string ToString() => $"({X}, {Y})";
}