namespace VttTools.Assets.Model;

/// <summary>
/// Reusable effect template (light sources, fog, weather, sounds, elevation changes)
/// Can be instantiated on multiple scenes via SceneEffect placements
/// </summary>
public record Effect {
    /// <summary>
    /// Unique identifier for the effect template
    /// </summary>
    public Guid Id { get; init; } = Guid.CreateVersion7();

    /// <summary>
    /// ID of the user who owns this effect template
    /// </summary>
    public Guid OwnerId { get; init; }

    /// <summary>
    /// Effect name (e.g., "Torch Light", "Fog of War", "Rain", "Darkness")
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Optional description of the effect's behavior
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Geometric shape of the effect's area of influence
    /// </summary>
    public EffectShape Shape { get; init; }

    /// <summary>
    /// Size/radius of the effect in grid units (-1 for infinite)
    /// </summary>
    public double Size { get; init; }

    /// <summary>
    /// Direction in degrees (for cone-shaped effects, null for omni-directional)
    /// </summary>
    public double? Direction { get; init; }

    /// <summary>
    /// Whether the effect is constrained/blocked by opaque structures
    /// </summary>
    public bool BoundedByStructures { get; init; }

    /// <summary>
    /// Optional visual resource (overlay image) for rendering the effect
    /// </summary>
    public Resource? Resource { get; init; }

    /// <summary>
    /// Optional category for UI filtering (e.g., "Light", "Weather", "Sound", "Magic")
    /// </summary>
    public string? Category { get; init; }

    /// <summary>
    /// When the effect template was created
    /// </summary>
    public DateTime CreatedAt { get; init; }
}