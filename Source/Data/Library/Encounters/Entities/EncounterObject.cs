using Asset = VttTools.Data.Assets.Entities.Asset;
using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Encounters.Entities;

public class EncounterObject {
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
    public Guid? ClosedDisplayId { get; set; }
    public Resource? ClosedDisplay { get; set; }
    public Guid? OpenedDisplayId { get; set; }
    public Resource? OpenedDisplay { get; set; }
    public Guid? DestroyedDisplayId { get; set; }
    public Resource? DestroyedDisplay { get; set; }

    public ObjectState State { get; set; } = ObjectState.Closed;
    public bool IsHidden { get; set; }
    public bool IsLocked { get; set; }
}
