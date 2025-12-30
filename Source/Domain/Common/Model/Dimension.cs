namespace VttTools.Common.Model;

public record Dimension(float Width, float Height) {
    public Dimension() : this(0, 0) { }

    public static Dimension Zero => new(0, 0);

    public override string ToString() => $"{Width:F2}x{Height:F2}";
}