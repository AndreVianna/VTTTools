namespace VttTools.Common.Model;

public record Point {
    public double X { get; init; }

    public double Y { get; init; }

    public Point(double x, double y) {
        X = x;
        Y = y;
    }

    public static Point Zero => new(0, 0);

    public override string ToString() => $"({X:F2}, {Y:F2})";
}