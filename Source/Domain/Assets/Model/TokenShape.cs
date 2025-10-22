namespace VttTools.Assets.Model;

/// <summary>
/// Defines the visual shape of entity tokens on the scene
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TokenShape {
    /// <summary>
    /// Circular token border
    /// </summary>
    Circle,

    /// <summary>
    /// Square token border
    /// </summary>
    Square
}