namespace VttTools.Common.Model;

public record Offset {
    public double Left { get; init; }
    public double Top { get; init; }

    public Offset(double left, double top) {
        Left = left;
        Top = top;
    }

    public static Offset Zero => new(0, 0);
    public override string ToString() => $"({Left:F2}, {Top:F2})";
}