namespace VttTools.Common.Model;

/// <summary>
/// Represents integer dimensions (width and height)
/// Used for asset sizes, image dimensions, and UI element sizing
/// </summary>
public record Size {
    /// <summary>
    /// Width dimension
    /// </summary>
    public int Width { get; init; }

    /// <summary>
    /// Height dimension
    /// </summary>
    public int Height { get; init; }

    /// <summary>
    /// Creates a new Size with the specified dimensions
    /// </summary>
    /// <exception cref="ArgumentException">Thrown if width or height is negative</exception>
    public Size(int width, int height) {
        if (width < 0)
            throw new ArgumentException("Width cannot be negative", nameof(width));
        if (height < 0)
            throw new ArgumentException("Height cannot be negative", nameof(height));
        Width = width;
        Height = height;
    }

    /// <summary>
    /// Zero-sized dimension (0 x 0)
    /// </summary>
    public static Size Zero => new(0, 0);

    /// <summary>
    /// Calculates the area (width * height)
    /// </summary>
    public int Area => Width * Height;

    /// <summary>
    /// Returns a string representation of the size
    /// </summary>
    public override string ToString() => $"{Width}x{Height}";
}