using Asset = VttTools.Data.Assets.Entities.Asset;
using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class EncounterAsset {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public ushort Index { get; set; }
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;

    [MaxLength(128)]
    public string? Name { get; set; }

    public bool IsLocked { get; set; }
    public bool IsVisible { get; set; } = true;

    public Frame Frame { get; set; } = new();
    public Guid? ImageId { get; set; }
    public Resource? Image { get; set; }

    public NamedSize Size { get; set; } = NamedSize.Default;
    public Position Position { get; set; } = Position.Zero;
    public float Rotation { get; set; }
    public float Elevation { get; set; }

    public Guid? ControlledBy { get; set; }

    [MaxLength(4096)]
    public string? Notes { get; set; }
}