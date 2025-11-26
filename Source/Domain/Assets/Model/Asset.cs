namespace VttTools.Assets.Model;

public record Asset {
    public Guid Id { get; init; } = Guid.CreateVersion7();

    public AssetClassification Classification { get; init; } = null!;

    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;

    public Resource? Portrait { get; init; }
    public NamedSize TokenSize { get; set; } = NamedSize.Default;
    public List<Resource> Tokens { get; init; } = [];

    public Dictionary<int, Map<StatBlockValue>> StatBlocks { get; init; } = [];

    public Guid OwnerId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
}
