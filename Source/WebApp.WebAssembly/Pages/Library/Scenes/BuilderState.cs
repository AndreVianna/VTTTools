namespace VttTools.WebApp.WebAssembly.Pages.Library.Scenes;

public sealed class BuilderState {
    public bool IsDragging { get; set; }
    public bool ShowChangeImageModal { get; set; }
    public bool ShowGridSettingsModal { get; set; }
    public bool ShowAssetSelectorModal { get; set; }
    public bool ShowAssetContextMenu { get; set; }
    public Point ContextMenuPosition { get; set; }

    // Stage state management
    public Guid SceneId { get; set; }
    public const int Padding = 0;
    public Size CanvasSize { get; set; } = new(0, 0);
    public Point PanOffset { get; set; } = new(0, 0);
    public float ZoomLevel { get; set; } = 1.0f;

    // Zoom constants
    public const float MinZoomLevel = 0.1f;
    public const float MaxZoomLevel = 4.0f;
    public const float ZoomStep = 0.1f;

    // Zoom state
    public bool IsZooming { get; set; }
    public Point ZoomCenter { get; set; } = new(0, 0);
    public GridDetails Grid { get; set; } = new() {
        Type = GridType.NoGrid,
        CellSize = new(50, 50),
        Offset = new(0, 0),
        Snap = false
    };

    // Panning state
    public bool IsPanning { get; set; }
    public bool HasMovedDuringPan { get; set; }
    public Point PanStartPosition { get; set; }
    public Point InitialScrollPosition { get; set; }

    // Asset state
    public string? LastDrawnBackgroundUrl { get; set; }
}