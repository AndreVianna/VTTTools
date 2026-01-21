namespace VttTools.Library.Stages.Model;

public record Shape {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public static Shape Default => new();

    public ShapeType Type { get; init; } = ShapeType.Circle;

    public float Length { get; init; }
    public float Width { get; init; }

    public float Radius { get; init; } = 1.0f;
    public float Arc { get; init; } = 53.0f;
    public float Direction { get; init; }

    public IReadOnlyList<Point> Vertices { get; init; } = [];

    public IReadOnlyList<string> Tags { get; init; } = [];
}