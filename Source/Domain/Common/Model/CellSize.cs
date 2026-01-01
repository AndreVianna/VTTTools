namespace VttTools.Common.Model;

public record CellSize {
    public double Width { get; init; }
    public double Height { get; init; }

    public CellSize(double width, double height) {
        if (width < 0)
            throw new ArgumentException("Width cannot be negative", nameof(width));
        if (height < 0)
            throw new ArgumentException("Height cannot be negative", nameof(height));
        Width = width;
        Height = height;
    }

    public static CellSize Default => new(50, 50);
    public static CellSize Zero => new(0, 0);
    public double Area => Width * Height;
    public override string ToString() => $"{Width:F2}x{Height:F2}";
}