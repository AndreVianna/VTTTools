namespace VttTools.WebApp.WebAssembly.Pages.Library.Scenes;

public sealed class BuilderInput {
    public GridType GridType { get; set; }
    public float GridCellWidth { get; set; }
    public float GridCellHeight { get; set; }
    public float GridOffsetX { get; set; }
    public float GridOffsetY { get; set; }
    public bool SnapToGrid { get; set; }
}
