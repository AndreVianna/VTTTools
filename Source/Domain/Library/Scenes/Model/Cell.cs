namespace VttTools.Library.Scenes.Model;

public record Cell {
    public float Size { get; init; } = 50.0f;
    public Vector2 Offset { get; init; }
    public Vector2 Scale { get; init; } = new(1.0f, 1.0f);
}
