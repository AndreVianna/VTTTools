namespace VttTools.WebApp.Client.Pages.Library.Scenes;

internal sealed class BuilderState {
    public bool SnapToGrid { get; set; } = true;
    public bool IsDragging { get; set; }
    public SceneAsset? SelectedAsset { get; set; }
}
