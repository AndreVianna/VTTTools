using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class EncounterResource {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;
    public ResourceRole Role { get; set; }
    public ushort Index { get; set; }
}
