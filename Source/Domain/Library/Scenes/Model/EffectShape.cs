namespace VttTools.Library.Scenes.Model;

/// <summary>
/// Defines the geometric shape of an effect's area of influence
/// </summary>
public enum EffectShape {
    /// <summary>
    /// Circular area radiating from origin
    /// </summary>
    Circle,

    /// <summary>
    /// Cone-shaped area with directional angle
    /// </summary>
    Cone,

    /// <summary>
    /// Square/rectangular area
    /// </summary>
    Square,

    /// <summary>
    /// Linear area (line of sight, wall of fire, etc.)
    /// </summary>
    Line
}