namespace VttTools.Data.Common.Entities;

public class Shape {
    public Guid Id { get; set; }

    [MaxLength(512)]
    public string Tags { get; set; } = "[]";

    public ShapeType Preset { get; set; } = ShapeType.Circle;

    public float Radius { get; set; } = 1.0f;

    public float Width { get; set; }

    public float Length { get; set; }

    public float Arc { get; set; } = 53.0f;

    public float Direction { get; set; }

    public ICollection<ShapeVertex> Vertices { get; set; } = [];
}
