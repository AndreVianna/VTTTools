namespace VttTools.WebApp.Client.Pages.Library.Scenes;

internal sealed class GridInput {
    public GridType Type { get; set; }
    public float CellWidth { get; set; }
    public float CellHeight { get; set; }
    public float OffsetLeft { get; set; }
    public float OffsetTop { get; set; }
}