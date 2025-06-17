namespace VttTools.Assets.Model;

public record Display : Resource {
    public Vector2 Scale { get; init; } = new(1, 1);
    public Point Offset { get; init; }
    public float Rotation { get; init; }
}