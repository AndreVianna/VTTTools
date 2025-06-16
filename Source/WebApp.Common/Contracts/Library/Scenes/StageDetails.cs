namespace VttTools.WebApp.Contracts.Library.Scenes;

public record StageDetails {
    public Guid Id { get; init; }
    public ResourceType Type { get; init; }
    public string Path { get; init; } = string.Empty;
    public Size ImageSize { get; init; }
    public Point Panning { get; init; }
    public float ZoomLevel { get; init; } = 1;
}