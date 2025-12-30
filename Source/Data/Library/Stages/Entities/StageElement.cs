using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Stages.Entities;

public class StageElement {
    public Guid StageId { get; set; }
    public Stage Stage { get; set; } = null!;
    public ushort Index { get; set; }

    [MaxLength(128)]
    public string? Name { get; set; }

    public Guid DisplayId { get; set; }
    public Resource Display { get; set; } = null!;

    public Position Position { get; set; } = Position.Zero;
    public float Rotation { get; set; }
    public float Elevation { get; set; }
    public NamedSize DisplaySize { get; set; } = NamedSize.Default;

    public float Opacity { get; set; } = 1.0f;
}
