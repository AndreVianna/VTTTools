namespace VttTools.Model.Game;

public class Asset {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    /// <summary>
    /// The owner of this asset.
    /// </summary>
    public Guid OwnerId { get; set; }
    public AssetType Type { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(512)]
    public string Source { get; set; } = string.Empty;
    /// <summary>
    /// The visibility setting for this asset.
    /// </summary>
    public Visibility Visibility { get; set; } = Visibility.Hidden;
    public Size Size { get; set; } = new();
}