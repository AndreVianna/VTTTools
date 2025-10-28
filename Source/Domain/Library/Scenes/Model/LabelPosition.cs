namespace VttTools.Library.Scenes.Model;

/// <summary>
/// Defines the vertical position of a label relative to the asset icon.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LabelPosition {
    /// <summary>
    /// Use scene default setting (for assets) or Bottom (for scene defaults).
    /// </summary>
    Default = 0,

    /// <summary>
    /// Position label above the asset icon.
    /// </summary>
    Top = 1,

    /// <summary>
    /// Position label in the middle (overlaying the asset icon).
    /// </summary>
    Middle = 2,

    /// <summary>
    /// Position label below the asset icon.
    /// </summary>
    Bottom = 3
}
