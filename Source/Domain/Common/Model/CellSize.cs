namespace VttTools.Common.Model;

/// <summary>
/// Represents floating-point grid cell dimensions
/// Used to define the size of grid cells in the encounter editor
/// </summary>
public record CellSize {
    /// <summary>
    /// Width of the grid cell in pixels
    /// </summary>
    public double Width { get; init; }

    /// <summary>
    /// Height of the grid cell in pixels
    /// </summary>
    public double Height { get; init; }

    /// <summary>
    /// Creates a new CellSize with the specified dimensions
    /// </summary>
    /// <exception cref="ArgumentException">Thrown if width or height is negative</exception>
    public CellSize(double width, double height) {
        if (width < 0)
            throw new ArgumentException("Width cannot be negative", nameof(width));
        if (height < 0)
            throw new ArgumentException("Height cannot be negative", nameof(height));
        Width = width;
        Height = height;
    }

    /// <summary>
    /// Open grid cell size (50x50 pixels)
    /// </summary>
    public static CellSize Default => new(50, 50);

    /// <summary>
    /// Zero-sized cell (0 x 0)
    /// </summary>
    public static CellSize Zero => new(0, 0);

    /// <summary>
    /// Calculates the area (width * height)
    /// </summary>
    public double Area => Width * Height;

    /// <summary>
    /// Returns a string representation of the cell size
    /// </summary>
    public override string ToString() => $"{Width:F2}x{Height:F2}";
}