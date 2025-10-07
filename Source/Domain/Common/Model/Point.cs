namespace VttTools.Common.Model;

/// <summary>
/// Represents a precise geometric point with floating-point coordinates
/// Used for structure vertices, effect origins, and other pixel-precise positioning
/// </summary>
public record Point {
    /// <summary>
    /// Horizontal coordinate
    /// </summary>
    public double X { get; init; }

    /// <summary>
    /// Vertical coordinate
    /// </summary>
    public double Y { get; init; }

    /// <summary>
    /// Creates a new Point with the specified coordinates
    /// </summary>
    public Point(double x, double y) {
        X = x;
        Y = y;
    }

    /// <summary>
    /// Origin point at (0, 0)
    /// </summary>
    public static Point Zero => new(0, 0);

    /// <summary>
    /// Returns a string representation of the point
    /// </summary>
    public override string ToString() => $"({X:F2}, {Y:F2})";
}
