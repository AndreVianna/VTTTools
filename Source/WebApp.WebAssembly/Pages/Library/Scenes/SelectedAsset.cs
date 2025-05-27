namespace VttTools.WebApp.WebAssembly.Pages.Library.Scenes;

public sealed class SelectedAsset {
    public Guid Id { get; set; }
    public uint Number { get; set; }
    public string Name { get; set; } = string.Empty;
    public AssetType Type { get; set; }
    public Point Position { get; set; }
    public Size Size { get; set; }
    public float Scale { get; set; }
    public float Rotation { get; set; }
    public float Elevation { get; set; }
    public bool IsLocked { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
}
