namespace VttTools.Library.Scenes.Model;

/// <summary>
/// Represents a placed asset instance on a scene
/// References an Asset template (ObjectAsset or EntityAsset)
/// </summary>
public record SceneAsset {
    public Guid AssetId { get; init; }  // Reference to Asset template
    public uint Index { get; init; }
    public uint Number { get; init; }

    // Overridable properties (if null/default, use template value)
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;  // Instance-specific name (e.g., "Goblin #3")
    [MaxLength(4096)]
    public string? Description { get; init; }  // Instance-specific description (e.g., "Goblin with bow")
    public Guid ResourceId { get; init; }  // REQUIRED - must select a resource from Asset.Resources (for token display)

    // Instance-specific data
    public NamedSize Size { get; init; } = NamedSize.Zero;
    public Position Position { get; init; } = Position.Zero;  // Cell-based placement position
    public float Rotation { get; init; }
    public Frame Frame { get; init; } = new Frame();
    public float Elevation { get; init; }
    public bool IsLocked { get; init; }
    public bool IsVisible { get; init; } = true;  // Whether visible to players (GM can hide traps, secret objects, etc.)
    public Guid? ControlledBy { get; init; }
}