namespace VttTools.Media.Model;

public record ResourceMetadata
    : ResourceFile {
    public Guid Id { get; init; } = Guid.CreateVersion7();

    public string? Description { get; init; }
    public Map<HashSet<string>> Features { get; init; } = [];

    public ResourceType ResourceType { get; init; }
    public ResourceClassification Classification { get; init; } = new();

    public string Path { get; init; } = string.Empty;

    public Guid OwnerId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
}