namespace VttTools.Library.Encounters.Model;

public record EncounterAsset {
    public Guid AssetId { get; init; }
    public ushort Index { get; init; }

    [MaxLength(128)]
    public string? Name { get; init; }

    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    public NamedSize Size { get; init; } = NamedSize.Zero;
    public ResourceMetadata? Image { get; init; }
    public Frame Frame { get; init; } = new Frame();

    public string? Notes { get; init; }

    public Guid? ControlledBy { get; init; }

    public bool IsLocked { get; init; }
    public bool IsVisible { get; init; } = true;
}