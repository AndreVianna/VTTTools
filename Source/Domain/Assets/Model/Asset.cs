namespace VttTools.Assets.Model;

public record Asset {
    public Guid Id { get; init; } = Guid.CreateVersion7();

    public AssetClassification Classification { get; init; } = null!;

    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;

    public Dictionary<Guid, Dictionary<int, Map<StatEntry>>> StatBlockEntries { get; init; } = [];

    public string[] Tags { get; init; } = [];
    public NamedSize Size { get; init; } = NamedSize.Default;

    public ResourceMetadata? Thumbnail { get; init; }
    public ResourceMetadata? Portrait { get; init; }
    public List<ResourceMetadata> Tokens { get; init; } = [];

    public Guid OwnerId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public bool IsDeleted { get; init; }
}