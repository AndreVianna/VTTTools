using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class EncounterSound {
    public Guid EncounterId { get; set; }
    public Encounter Encounter { get; set; } = null!;
    public uint Index { get; set; }

    [MaxLength(128)]
    public string? Name { get; set; }

    public Point Position { get; set; } = Point.Zero;
    public float Range { get; set; }
    public bool IsPlaying { get; set; }
    public bool Loop { get; set; }

    public Guid? ResourceId { get; set; }
    public Resource? Resource { get; set; }
}