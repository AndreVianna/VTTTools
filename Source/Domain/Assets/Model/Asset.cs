namespace VttTools.Assets.Model;

public class Asset {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    public AssetType Type { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public Format Format { get; set; } = new();
    public bool IsListed { get; set; }
    public bool IsPublic { get; set; }
}