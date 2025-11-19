namespace VttTools.Library.Encounters.Model;

/// <summary>
/// Represents a placed asset instance on a encounter
/// References an Asset template (ObjectAsset or EntityAsset)
/// </summary>
public record EncounterAsset {
    public Guid AssetId { get; init; }
    public uint Index { get; init; }
    public uint Number { get; init; }

    /// <summary>
    /// Instance-specific name override for this asset placement (e.g., "Goblin #3", "Guard Captain")
    /// If empty, the template asset's name will be used
    /// </summary>
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The image resource displayed for this encounter asset instance
    /// This can be:
    /// 1. One of the 4 standard asset images (Portrait, TopDown, Miniature, Photo) - automatically selected based on:
    ///    - ViewMode (TacticalMap, TheaterOfTheMind, HybridView, Storytelling) - determines presentation context
    ///    - MapType (Battlegrid, HexGrid, ZonedMap, FreeformMap) - determines spatial representation
    /// 2. A custom user-uploaded image that overrides the asset's standard images for this specific instance
    /// If null, the system will select the appropriate image from the asset template based on ViewMode and ImageType
    /// </summary>
    public Resource? Image { get; init; }

    public bool IsLocked { get; init; }
    public bool IsVisible { get; init; } = true;
    public NamedSize Size { get; init; } = NamedSize.Zero;
    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    public Frame Frame { get; init; } = new Frame();
    public string? Notes { get; init; }

    public Guid? ControlledBy { get; init; }
}