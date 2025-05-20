namespace VttTools.Library.Scenes.Model;

public record Stage {
    public Shape Shape { get; init; } = new();
    public float ZoomLevel { get; init; } = 1.0f;
    public Grid Grid { get; init; } = new();
}