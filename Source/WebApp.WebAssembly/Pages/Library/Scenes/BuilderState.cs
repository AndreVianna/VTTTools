namespace VttTools.WebApp.WebAssembly.Pages.Library.Scenes;

internal sealed class BuilderState {
    public bool IsReady { get; set; }
    public bool IsDragging { get; set; }
    public bool ShowChangeImageModal { get; set; }
    public bool ShowGridSettingsModal { get; set; }
    public bool ShowAssetSelectorModal { get; set; }
    public bool ShowAssetContextMenu { get; set; }
    public Point ContextMenuPosition { get; set; }
}
