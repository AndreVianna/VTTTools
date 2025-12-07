namespace VttTools.Library.Encounters.Model;

public record Stage {
    public ResourceMetadata? Background { get; init; }
    public float ZoomLevel { get; init; } = 1;
    public Point Panning { get; init; } = Point.Zero;
    public AmbientLight Light { get; init; }
    public Weather Weather { get; init; }
    public float Elevation { get; init; }
    public ResourceMetadata? Sound { get; init; }
}