namespace VttTools.WebApp.Contracts.Library.Scenes;

public record StageDetails {
    public string Id { get; init; } = string.Empty;
    public DisplayType Type { get; init; }
    public Size Size { get; init; }
    public float ZoomLevel { get; init; } = 1;
}
