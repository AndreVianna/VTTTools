namespace VttTools.WebApp.Contracts.Library.Scenes;

public record GridDetails {
    public GridType Type { get; init; }
    public Vector2 CellSize { get; init; }
    public Vector2 Offset { get; init; }
    public bool Snap { get; init; }
}