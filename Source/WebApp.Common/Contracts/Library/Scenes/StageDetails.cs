namespace VttTools.WebApp.Contracts.Library.Scenes;

public record StageDetails {
    public string? FileName { get; init; }
    public ResourceType Type { get; init; }
    public Size Size { get; init; }
    public float ZoomLevel { get; init; } = 1;
}
