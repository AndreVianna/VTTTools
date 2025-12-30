namespace VttTools.Data.Library.Stages.Entities;

public class StageLight {
    public Guid StageId { get; set; }
    public Stage Stage { get; set; } = null!;
    public ushort Index { get; set; }

    [MaxLength(128)]
    public string? Name { get; set; }

    public LightSourceType Type { get; set; }
    public Point Position { get; set; } = Point.Zero;
    public float Range { get; set; }
    public float? Direction { get; set; }
    public float? Arc { get; set; }
    public bool IsOn { get; set; } = true;

    [MaxLength(16)]
    public string? Color { get; set; }
}
