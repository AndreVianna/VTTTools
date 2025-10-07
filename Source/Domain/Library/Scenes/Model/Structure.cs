namespace VttTools.Library.Scenes.Model;

/// <summary>
/// Reusable structure template (walls, doors, windows, gates)
/// Can be instantiated on multiple scenes via SceneStructure placements
/// </summary>
public record Structure {
    /// <summary>
    /// Unique identifier for the structure template
    /// </summary>
    public Guid Id { get; init; } = Guid.CreateVersion7();

    /// <summary>
    /// ID of the user who owns this structure template
    /// </summary>
    public Guid OwnerId { get; init; }

    /// <summary>
    /// Structure name (e.g., "Stone Wall", "Wooden Door", "Secret Passage")
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Optional description of the structure's purpose and behavior
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Whether the structure blocks movement
    /// </summary>
    public bool IsBlocking { get; init; } = true;

    /// <summary>
    /// Whether the structure blocks line of sight and light
    /// </summary>
    public bool IsOpaque { get; init; } = true;

    /// <summary>
    /// Whether the structure is hidden from players until revealed
    /// </summary>
    public bool IsSecret { get; init; } = false;

    /// <summary>
    /// Whether the structure can be opened/closed (doors, gates)
    /// </summary>
    public bool IsOpenable { get; init; } = false;

    /// <summary>
    /// Whether the structure requires a key/unlock action to open
    /// </summary>
    public bool IsLocked { get; init; } = false;

    /// <summary>
    /// Optional visual resource (texture, image) for rendering
    /// </summary>
    public Resource? Visual { get; init; }

    /// <summary>
    /// When the structure template was created
    /// </summary>
    public DateTime CreatedAt { get; init; }
}
