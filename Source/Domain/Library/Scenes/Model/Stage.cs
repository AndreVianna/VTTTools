namespace VttTools.Library.Scenes.Model;

public record Stage {
    public Resource? Background { get; init; }
    public float ZoomLevel { get; init; } = 1;
    public Point Panning { get; init; } = Point.Zero;
    public Light Light { get; init; }
    public Weather Weather { get; init; }
    public float Elevation { get; init; }
    public Resource? Sound { get; init; }
}