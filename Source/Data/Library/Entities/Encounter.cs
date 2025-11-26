using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class Encounter {
    public Guid AdventureId { get; set; }
    public Adventure Adventure { get; set; } = null!;
    public Guid Id { get; set; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public Guid? BackgroundId { get; set; }
    public Resource? Background { get; set; }
    public float ZoomLevel { get; set; } = 1;
    public Point Panning { get; set; } = Point.Zero;
    public Grid Grid { get; set; } = new();
    public Light Light { get; set; }
    public Weather Weather { get; set; }
    public float Elevation { get; set; }
    public Guid? SoundId { get; set; }
    public Resource? Sound { get; set; }
    public ICollection<EncounterAsset> EncounterAssets { get; set; } = [];
    public ICollection<EncounterWall> Walls { get; set; } = [];
    public ICollection<EncounterOpening> Openings { get; set; } = [];
    public ICollection<EncounterRegion> Regions { get; set; } = [];
    public ICollection<EncounterSource> Sources { get; set; } = [];
}