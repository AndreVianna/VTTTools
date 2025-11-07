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
    public Resource? Token { get; init; }
    public Resource? Portrait { get; init; }

    public bool IsLocked { get; init; }
    public bool IsVisible { get; init; } = true;  // Whether visible to players (GM can hide traps, secret objects, etc.)

    // Instance-specific data
    public NamedSize Size { get; init; } = NamedSize.Zero;
    public Position Position { get; init; } = Position.Zero;  // Cell-based placement position
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    public Frame Frame { get; init; } = new Frame();
    public string? Notes { get; init; }

    public Guid? ControlledBy { get; init; }
}