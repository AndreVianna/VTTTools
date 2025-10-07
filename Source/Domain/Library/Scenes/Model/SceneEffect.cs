namespace VttTools.Library.Scenes.Model;

/// <summary>
/// Placement instance of an Effect template on a specific scene
/// Contains the actual origin point and instance-specific overrides
/// </summary>
public record SceneEffect {
    /// <summary>
    /// Unique identifier for this effect instance
    /// </summary>
    public Guid Id { get; init; } = Guid.CreateVersion7();

    /// <summary>
    /// ID of the scene this effect is placed on
    /// </summary>
    public Guid SceneId { get; init; }

    /// <summary>
    /// Reference to the Effect template
    /// </summary>
    public Guid EffectId { get; init; }

    /// <summary>
    /// Origin point where the effect is centered/starts
    /// </summary>
    public Point Origin { get; init; }

    /// <summary>
    /// Instance-specific override: size/radius of this effect instance
    /// If null, uses the template's Size
    /// </summary>
    public int? Size { get; init; }

    /// <summary>
    /// Instance-specific override: direction in degrees (for cone effects)
    /// If null, uses the template's Direction
    /// </summary>
    public int? Direction { get; init; }
}
