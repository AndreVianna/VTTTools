using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets.Entities;

public class Asset {
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public AssetKind Kind { get; set; } = AssetKind.Undefined;
    [MaxLength(64)]
    public string Category { get; set; } = string.Empty;
    [MaxLength(64)]
    public string Type { get; set; } = string.Empty;
    [MaxLength(64)]
    public string? Subtype { get; set; }

    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;

    public NamedSize TokenSize { get; set; } = NamedSize.Default;

    public ICollection<AssetStatEntry> StatEntries { get; set; } = [];

    public string[] Tags { get; set; } = [];

    public Guid OwnerId { get; set; }
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
    public bool IsDeleted { get; set; }

    public ICollection<AssetResource> Resources { get; set; } = [];
}