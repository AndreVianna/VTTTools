namespace VttTools.Common.Model;

public record Dimension {
    public double Width { get; init; }
    public double Height { get; init; }

    public Dimension(double width, double height) {
        Width = width;
        Height = height;
    }

    public static Dimension Zero => new(0, 0);

    public override string ToString() => $"{Width:F2}x{Height:F2}";
}