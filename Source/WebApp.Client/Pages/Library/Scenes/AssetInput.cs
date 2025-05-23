namespace VttTools.WebApp.Client.Pages.Library.Scenes;

internal sealed class AssetInput {
    public Guid Id { get; set; }
    public uint Number { get; set; }
    public string Name { get; set; } = string.Empty;
    public AssetType Type { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public float SizeX { get; init; }
    public float SizeY { get; init; }
    public float ScaleX { get; init; }
    public float ScaleY { get; init; }
    public float Rotation { get; set; }
    public float Elevation { get; set; }
    public bool IsLocked { get; set; }
    public MediaType MediaType { get; init; }
    public Guid? SourceId { get; init; }
    public IBrowserFile? SelectedImageFile { get; set; }
    public IBrowserFile? SelectedAssetFile { get; set; }
}
