namespace VttTools.Library.Scenes.Model;

/// <summary>
/// Represents a placed asset instance on a scene
/// References an Asset template (ObjectAsset or EntityAsset)
/// </summary>
public record SceneAsset {
    public Guid AssetId { get; init; }  // Reference to Asset template
    public uint Index { get; init; }
    public uint Number { get; init; }

    // Overridable properties (if null, use template value)
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;  // Instance-specific name (e.g., "Goblin #3")
    [MaxLength(4096)]
    public string? Description { get; init; }  // Instance-specific description (e.g., "Goblin with bow")
    public Guid? ResourceId { get; init; }  // Instance-specific image (custom token art, variant)

    // Instance-specific data
    public Size Size { get; init; } = Size.Zero;
    public Position Position { get; init; } = Position.Zero;  // Cell-based placement position
    public float Rotation { get; init; }
    public Frame? Frame { get; init; }
    public float Elevation { get; init; }
    public bool IsLocked { get; init; }
    public Guid? ControlledBy { get; init; }
}