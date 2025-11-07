namespace VttTools.Common.Model;

/// <summary>
/// Represents a size with optional named category
/// Supports square (1 dimension) and rectangular (2 dimensions) sizes
/// </summary>
public record NamedSize {
    /// <summary>
    /// Width in grid cells (supports fractional: 0.125, 0.25, 0.5, or whole numbers)
    /// </summary>
    public double Width { get; init; }

    /// <summary>
    /// Height in grid cells (supports fractional: 0.125, 0.25, 0.5, or whole numbers)
    /// </summary>
    public double Height { get; init; }

    private const double _tolerance = 0.001;

    /// <summary>
    /// Gets the named size category based on current Width, Height, and IsSquare
    /// Returns Custom for rectangular sizes or non-standard square sizes
    /// </summary>
    [NotMapped]
    public SizeName Name {
        get => Math.Abs(Width - Height) < _tolerance
                ? FromSize(_tolerance)
                : SizeName.Custom;
        init {
            var namedSize = FromName(value);
            Width = namedSize.Width;
            Height = namedSize.Height;
        }
    }

    private static SizeName FromSize(double value)
        => Math.Abs(value) < _tolerance ? SizeName.Zero
         : Math.Abs(value - 0.125) < _tolerance ? SizeName.Miniscule
         : Math.Abs(value - 0.25) < _tolerance ? SizeName.Tiny
         : Math.Abs(value - 0.5) < _tolerance ? SizeName.Small
         : Math.Abs(value - 1.0) < _tolerance ? SizeName.Medium
         : Math.Abs(value - 2.0) < _tolerance ? SizeName.Large
         : Math.Abs(value - 3.0) < _tolerance ? SizeName.Huge
         : Math.Abs(value - 4.0) < _tolerance ? SizeName.Gargantuan
         : SizeName.Custom;

    /// <summary>
    /// Creates a NamedSize from a SizeName enum value
    /// </summary>
    public static NamedSize FromName(SizeName name) => name switch {
        SizeName.Zero => new() { Width = 0, Height = 0 },
        SizeName.Miniscule => new() { Width = 0.125, Height = 0.125 },
        SizeName.Tiny => new() { Width = 0.25, Height = 0.25 },
        SizeName.Small => new() { Width = 0.5, Height = 0.5 },
        SizeName.Medium => new() { Width = 1, Height = 1 },
        SizeName.Large => new() { Width = 2, Height = 2 },
        SizeName.Huge => new() { Width = 3, Height = 3 },
        SizeName.Gargantuan => new() { Width = 4, Height = 4 },
        SizeName.Custom => new() { Width = 1, Height = 1 },  // Default custom
        _ => new() { Width = 1, Height = 1 }
    };

    /// <summary>
    /// Default size (Medium: 1x1 square)
    /// </summary>
    public static NamedSize Default => FromName(SizeName.Medium);

    /// <summary>
    /// Zero size (0x0)
    /// </summary>
    public static NamedSize Zero => FromName(SizeName.Zero);

    /// <summary>
    /// Creates a NamedSize from specified width and height
    /// </summary>
    public static NamedSize FromSize(double width, double? height = null) => new() { Width = width, Height = height ?? width };
}