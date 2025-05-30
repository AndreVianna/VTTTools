namespace VttTools.WebApp.WebAssembly.Pages.Library.Scenes;

public sealed class GuidInput {
    public GridType Type { get; set; }
    public float CellWidth { get; set; }
    public float CellHeight { get; set; }
    public float OffsetX { get; set; }
    public float OffsetY { get; set; }
    public bool SnapToGrid { get; set; }
}