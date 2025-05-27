namespace VttTools.Assets.Model;

public record Asset {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }
    public AssetType Type { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    public Display Display { get; init; } = new();
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
}