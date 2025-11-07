namespace VttTools.Common.Model;

/// <summary>
/// Defines when to display a label for a scene asset.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LabelVisibility {
    /// <summary>
    /// Use scene default setting (for assets) or Always (for scene defaults).
    /// </summary>
    Default = 0,

    /// <summary>
    /// Always display the label.
    /// </summary>
    Always = 1,

    /// <summary>
    /// Only display the label when hovering over the asset.
    /// </summary>
    OnHover = 2,

    /// <summary>
    /// Never display the label.
    /// </summary>
    Never = 3
}