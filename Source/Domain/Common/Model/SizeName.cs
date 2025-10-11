namespace VttTools.Common.Model;

/// <summary>
/// Named size categories for assets
/// Values 1-7 are standard sizes, 0 is zero/undefined, 99 is custom
/// </summary>
public enum SizeName {
    /// <summary>
    /// No size / 0x0
    /// </summary>
    Zero = 0,

    /// <summary>
    /// Miniscule - 0.125x0.125 (⅛ cell)
    /// </summary>
    Miniscule = 1,

    /// <summary>
    /// Tiny - 0.25x0.25 (¼ cell)
    /// </summary>
    Tiny = 2,

    /// <summary>
    /// Small - 0.5x0.5 (½ cell)
    /// </summary>
    Small = 3,

    /// <summary>
    /// Medium - 1x1 (1 cell)
    /// </summary>
    Medium = 4,

    /// <summary>
    /// Large - 2x2 (2 cells)
    /// </summary>
    Large = 5,

    /// <summary>
    /// Huge - 3x3 (3 cells)
    /// </summary>
    Huge = 6,

    /// <summary>
    /// Gargantuan - 4x4 (4 cells)
    /// </summary>
    Gargantuan = 7,

    /// <summary>
    /// Custom - Any other size (non-standard or rectangular)
    /// </summary>
    Custom = 99
}