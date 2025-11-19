using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets.Entities;

public abstract class Asset {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    public AssetKind Kind { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public Guid? PortraitId { get; set; }
    public Resource? Portrait { get; set; }
    public Guid? TopDownId { get; set; }
    public Resource? TopDown { get; set; }
    public Guid? MiniatureId { get; set; }
    public Resource? Miniature { get; set; }
    public Guid? PhotoId { get; set; }
    public Resource? Photo { get; set; }
    public NamedSize Size { get; set; } = NamedSize.Default;
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
}