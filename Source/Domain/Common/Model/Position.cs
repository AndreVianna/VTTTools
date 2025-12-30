namespace VttTools.Common.Model;

public record Position(double X, double Y) {
    /// <summary>
    /// Origin position at (0, 0)
    /// </summary>
    public static Position Zero => new(0, 0);

    /// <summary>
    /// Returns a string representation of the position
    /// </summary>
    public override string ToString() => $"({X}, {Y})";
}