namespace VttTools.Common.Model;

public record Size {
    public int Width { get; init; }
    public int Height { get; init; }

    public Size(int width, int height) {
        if (width < 0)
            throw new ArgumentException("Width cannot be negative", nameof(width));
        if (height < 0)
            throw new ArgumentException("Height cannot be negative", nameof(height));
        Width = width;
        Height = height;
    }

    public static Size Zero => new(0, 0);
    public int Area => Width * Height;
    public override string ToString() => $"{Width}x{Height}";
}