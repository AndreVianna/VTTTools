using Asset = VttTools.Data.Assets.Entities.Asset;
using Resource = VttTools.Data.Media.Entities.Resource;

using Shape = VttTools.Data.Common.Entities.Shape;

namespace VttTools.Data.Library.Encounters.Entities;

public class EncounterEffect {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public ushort Index { get; set; }

    [MaxLength(128)]
    public string? Name { get; set; }

    public Position Position { get; set; } = Position.Zero;
    public float Rotation { get; set; }

    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;

    public Guid? DisplayId { get; set; }
    public Resource? Display { get; set; }
    public Guid? EnabledDisplayId { get; set; }
    public Resource? EnabledDisplay { get; set; }
    public Guid? DisabledDisplayId { get; set; }
    public Resource? DisabledDisplay { get; set; }
    public Guid? OnTriggerDisplayId { get; set; }
    public Resource? OnTriggerDisplay { get; set; }
    public Guid? TriggeredDisplayId { get; set; }
    public Resource? TriggeredDisplay { get; set; }
    public EffectState State { get; set; } = EffectState.Enabled;

    public bool IsHidden { get; set; }

    public Guid? TriggerShapeId { get; set; }
    public Shape? TriggerShape { get; set; }
}
