namespace VttTools.WebApp.Client.Pages.Library.Scenes;

internal sealed class BuilderState {
    public bool IsReady { get; set; }
    public bool SnapToGrid { get; set; } = true;
    public bool IsDragging { get; set; }
    public bool ShowChangeImageModal { get; set; }
    public bool ShowGridSettingsModal { get; set; }
    public bool ShowAssetSelectorModal { get; set; }
    public bool ShowAssetContextMenu { get; set; }
    public Vector2 ContextMenuPosition { get; set; }
}
