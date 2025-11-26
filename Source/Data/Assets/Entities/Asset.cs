using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets.Entities;

public class Asset {
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public AssetClassification Classification { get; set; } = null!;

    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;

    public Guid? PortraitId { get; set; }
    public Resource? Portrait { get; set; }
    public NamedSize TokenSize { get; set; } = NamedSize.Default;
    public ICollection<AssetToken> AssetTokens { get; set; } = [];

    public ICollection<AssetStatBlockValue> StatBlock { get; set; } = [];

    public Guid OwnerId { get; set; }
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
}
