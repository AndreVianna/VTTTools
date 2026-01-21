using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Stages.Entities;

public class Stage {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }

    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;

    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }

    public float ZoomLevel { get; set; } = 1;
    public Point Panning { get; set; } = Point.Zero;

    public Guid? MainBackgroundId { get; set; }
    public Resource? MainBackground { get; set; }
    public Guid? AlternateBackgroundId { get; set; }
    public Resource? AlternateBackground { get; set; }
    public bool UseAlternateBackground { get; set; }
    public AmbientLight AmbientLight { get; set; }
    public Guid? AmbientSoundId { get; set; }
    public Resource? AmbientSound { get; set; }
    public AmbientSoundSource AmbientSoundSource { get; set; } = AmbientSoundSource.NotSet;
    public float AmbientSoundVolume { get; set; } = 1.0f;
    public bool AmbientSoundLoop { get; set; } = true;
    public bool AmbientSoundIsPlaying { get; set; }
    public Weather Weather { get; set; }

    public GridType GridType { get; set; } = GridType.Square;
    public CellSize GridCellSize { get; set; } = CellSize.Default;
    public Offset GridOffset { get; set; } = Offset.Zero;
    public double GridScale { get; set; } = 5.0;

    public ICollection<StageWall> Walls { get; set; } = [];
    public ICollection<StageRegion> Regions { get; set; } = [];
    public ICollection<StageLight> Lights { get; set; } = [];
    public ICollection<StageElement> Elements { get; set; } = [];
    public ICollection<StageSound> Sounds { get; set; } = [];
}