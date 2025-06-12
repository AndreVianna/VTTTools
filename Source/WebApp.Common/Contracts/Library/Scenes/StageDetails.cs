namespace VttTools.WebApp.Contracts.Library.Scenes;

public record StageDetails {
    public Guid Id { get; init; }
    public string Path { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public Size Size { get; init; }
    public Point Offset { get; init; }
    public float ZoomLevel { get; init; } = 1;
}