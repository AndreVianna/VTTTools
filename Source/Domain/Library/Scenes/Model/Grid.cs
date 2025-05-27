namespace VttTools.Library.Scenes.Model;

public record Grid {
    public GridType Type { get; init; }
    public Vector2 CellSize { get; init; } = new(50.0f, 50.0f);
    public Vector2 Offset { get; init; }
    public bool Snap { get; init; }
}