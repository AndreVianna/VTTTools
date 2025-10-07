namespace VttTools.Library.Scenes.Model;

/// <summary>
/// Placement instance of a Structure template on a specific scene
/// Contains the actual geometric data (vertices) and instance-specific overrides
/// </summary>
public record SceneStructure {
    /// <summary>
    /// Unique identifier for this structure instance
    /// </summary>
    public Guid Id { get; init; } = Guid.CreateVersion7();

    /// <summary>
    /// ID of the scene this structure is placed on
    /// </summary>
    public Guid SceneId { get; init; }

    /// <summary>
    /// Reference to the Structure template
    /// </summary>
    public Guid StructureId { get; init; }

    /// <summary>
    /// Vertices defining the structure's geometry (connected points forming walls/doors)
    /// </summary>
    public List<Point> Vertices { get; init; } = new();

    /// <summary>
    /// Instance-specific override: whether this door/gate is currently open
    /// If null, uses the template's default
    /// </summary>
    public bool? IsOpen { get; init; }

    /// <summary>
    /// Instance-specific override: whether this door/gate is locked
    /// If null, uses the template's default
    /// </summary>
    public bool? IsLocked { get; init; }

    /// <summary>
    /// Instance-specific override: whether this structure is revealed to players
    /// If null, uses the template's IsSecret default
    /// </summary>
    public bool? IsSecret { get; init; }
}
