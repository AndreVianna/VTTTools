using Asset = VttTools.Data.Assets.Entities.Asset;
using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Encounters.Entities;

public class EncounterActor {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public ushort Index { get; set; }

    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;

    [MaxLength(128)]
    public string? Name { get; set; }

    public Position Position { get; set; } = Position.Zero;
    public float Rotation { get; set; }
    public float Elevation { get; set; }
    public NamedSize Size { get; set; } = NamedSize.Default;

    public Guid? DisplayId { get; set; }
    public Resource? Display { get; set; }

    public Frame Frame { get; set; } = new();

    public Guid? ControlledBy { get; set; }
    public bool IsHidden { get; set; }
    public bool IsLocked { get; set; }
}