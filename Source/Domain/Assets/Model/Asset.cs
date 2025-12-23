namespace VttTools.Assets.Model;

public record Asset {
    public Guid Id { get; init; } = Guid.CreateVersion7();

    public AssetClassification Classification { get; init; } = null!;

    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;

    public ResourceMetadata? Portrait { get; init; }
    public NamedSize TokenSize { get; init; } = NamedSize.Default;
    public List<ResourceMetadata> Tokens { get; init; } = [];

    public Dictionary<int, Map<StatBlockValue>> StatBlocks { get; init; } = [];

    /// <summary>
    /// Stat entries organized by GameSystem, Level, and StatKey.
    /// Structure: GameSystemId → Level → StatKey → StatEntry
    /// </summary>
    public Dictionary<Guid, Dictionary<int, Map<StatEntry>>> StatEntries { get; init; } = [];

    public string[] Tags { get; init; } = [];

    public Guid OwnerId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public bool IsDeleted { get; init; }
}