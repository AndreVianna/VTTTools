namespace VttTools.WebApp.Client.Pages.Library.Scenes;

internal sealed class AssetInput {
    public string Name { get; set; } = string.Empty;
    public AssetType Type { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public float Rotation { get; set; }
    public float SizeWidth { get; init; }
    public float SizeHeight { get; init; }
    public float Scale { get; set; }
    public bool IsLocked { get; set; }
    public MediaType MediaType { get; init; }
    public Guid? SourceId { get; init; }
    public IBrowserFile? SelectedImageFile { get; set; }
    public IBrowserFile? SelectedAssetFile { get; set; }
}
