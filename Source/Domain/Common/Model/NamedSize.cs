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

    /// <summary>
    /// Whether this is a square size (Width = Height enforced)
    /// When true, changing Width should also update Height to match
    /// </summary>
    public bool IsSquare { get; init; }

    /// <summary>
    /// Gets the named size category based on current Width, Height, and IsSquare
    /// Returns Custom for rectangular sizes or non-standard square sizes
    /// </summary>
    public SizeName Name {
        get {
            if (Width == 0 && Height == 0) return SizeName.Zero;
            if (!IsSquare) return SizeName.Custom;  // Rectangles are always Custom

            // Match square sizes to named values (with tolerance for floating point)
            const double tolerance = 0.001;
            if (Math.Abs(Width - 0.125) < tolerance) return SizeName.Miniscule;
            if (Math.Abs(Width - 0.25) < tolerance) return SizeName.Tiny;
            if (Math.Abs(Width - 0.5) < tolerance) return SizeName.Small;
            if (Math.Abs(Width - 1.0) < tolerance) return SizeName.Medium;
            if (Math.Abs(Width - 2.0) < tolerance) return SizeName.Large;
            if (Math.Abs(Width - 3.0) < tolerance) return SizeName.Huge;
            if (Math.Abs(Width - 4.0) < tolerance) return SizeName.Gargantuan;

            return SizeName.Custom;  // Non-standard square size
        }
    }

    /// <summary>
    /// Creates a NamedSize from a SizeName enum value
    /// </summary>
    public static NamedSize FromName(SizeName name) => name switch {
        SizeName.Zero => new() { Width = 0, Height = 0, IsSquare = true },
        SizeName.Miniscule => new() { Width = 0.125, Height = 0.125, IsSquare = true },
        SizeName.Tiny => new() { Width = 0.25, Height = 0.25, IsSquare = true },
        SizeName.Small => new() { Width = 0.5, Height = 0.5, IsSquare = true },
        SizeName.Medium => new() { Width = 1, Height = 1, IsSquare = true },
        SizeName.Large => new() { Width = 2, Height = 2, IsSquare = true },
        SizeName.Huge => new() { Width = 3, Height = 3, IsSquare = true },
        SizeName.Gargantuan => new() { Width = 4, Height = 4, IsSquare = true },
        SizeName.Custom => new() { Width = 1, Height = 1, IsSquare = false },  // Default custom
        _ => new() { Width = 1, Height = 1, IsSquare = true }
    };

    /// <summary>
    /// Default size (Medium: 1x1 square)
    /// </summary>
    public static NamedSize Default => FromName(SizeName.Medium);

    /// <summary>
    /// Zero size (0x0)
    /// </summary>
    public static NamedSize Zero => FromName(SizeName.Zero);
}
