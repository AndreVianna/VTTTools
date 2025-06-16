namespace VttTools.Library.Scenes.Model;

public record Stage {
    public Resource Background { get; init; } = null!;
    public float ZoomLevel { get; init; } = 1;
    public Point Panning { get; init; }
}
