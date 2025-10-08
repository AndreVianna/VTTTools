namespace VttTools.Common.Model;

/// <summary>
/// Represents a 2D floating-point offset or translation
/// Used for grid positioning offsets and alignment adjustments
/// </summary>
public record Offset {
    /// <summary>
    /// Horizontal offset from the left edge
    /// </summary>
    public double Left { get; init; }

    /// <summary>
    /// Vertical offset from the top edge
    /// </summary>
    public double Top { get; init; }

    /// <summary>
    /// Creates a new Offset with the specified values
    /// </summary>
    public Offset(double left, double top) {
        Left = left;
        Top = top;
    }

    /// <summary>
    /// Zero offset (0, 0)
    /// </summary>
    public static Offset Zero => new(0, 0);

    /// <summary>
    /// Returns a string representation of the offset
    /// </summary>
    public override string ToString() => $"({Left:F2}, {Top:F2})";
}