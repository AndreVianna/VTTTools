namespace VttTools.Common.Model;

public record Position(double X, double Y) {
    public static Position Zero => new(0, 0);
    public override string ToString() => $"({X}, {Y})";
}