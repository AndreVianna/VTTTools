using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Stages.Entities;

public class StageSound {
    public Guid StageId { get; set; }
    public Stage Stage { get; set; } = null!;
    public ushort Index { get; set; }

    [MaxLength(128)]
    public string? Name { get; set; }

    public Point Position { get; set; } = Point.Zero;
    public float Radius { get; set; } = 10.0f;
    public float Volume { get; set; } = 1.0f;
    public bool Loop { get; set; } = true;
    public bool IsPlaying { get; set; }

    public Guid MediaId { get; set; }
    public Resource Media { get; set; } = null!;
}
