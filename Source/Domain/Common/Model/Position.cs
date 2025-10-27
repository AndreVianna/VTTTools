namespace VttTools.Common.Model;

public record Position {
    public double X { get; init; }

    public double Y { get; init; }

    public Position(double x, double y) {
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