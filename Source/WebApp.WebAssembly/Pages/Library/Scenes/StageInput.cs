namespace VttTools.WebApp.Pages.Library.Scenes;

public sealed class StageInput {
    public string ImageUrl { get; set; } = string.Empty;
    public int Width { get; set; }
    public int Height { get; set; }
    public float ZoomLevel { get; set; } = 1.0f;
}