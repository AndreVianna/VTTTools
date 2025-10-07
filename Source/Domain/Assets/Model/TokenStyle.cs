namespace VttTools.Assets.Model;

/// <summary>
/// Defines visual styling for entity tokens
/// </summary>
public record TokenStyle {
    /// <summary>
    /// Token border color (hex format, e.g., "#FF5733")
    /// </summary>
    public string? BorderColor { get; init; }

    /// <summary>
    /// Token background color (hex format, e.g., "#FFFFFF")
    /// </summary>
    public string? BackgroundColor { get; init; }

    /// <summary>
    /// Token border shape
    /// </summary>
    public TokenShape Shape { get; init; } = TokenShape.Circle;
}
