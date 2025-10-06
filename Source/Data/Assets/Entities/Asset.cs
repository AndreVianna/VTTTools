using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets.Entities;

public class Asset {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    public AssetType Type { get; set; }
    public AssetCategory Category { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public Guid? ResourceId { get; set; }
    public Resource? Resource { get; set; }
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
}
