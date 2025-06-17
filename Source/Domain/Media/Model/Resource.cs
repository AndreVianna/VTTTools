namespace VttTools.Media.Model;

public record Resource {
    public Guid Id { get; init; }
    public ResourceType Type { get; init; }
    public string Path { get; init; } = string.Empty;
    public ResourceMetadata Metadata { get; init; } = new();
    public string[] Tags { get; init; } = [];
}