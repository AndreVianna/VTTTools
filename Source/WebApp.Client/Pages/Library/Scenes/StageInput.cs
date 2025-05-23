namespace VttTools.WebApp.Client.Pages.Library.Scenes;

internal sealed class StageInput {
    public string ImageUrl { get; init; } = string.Empty;
    public int Width { get; init; }
    public int Height { get; init; }
    public float ZoomLevel { get; init; } = 1.0f;
}
