namespace VttTools.Media.Model;

public record Resource {
    public Guid Id { get; init; } = Guid.CreateVersion7();

    public string? Description { get; init; }
    public Map<HashSet<string>> Features { get; init; } = [];

    public ResourceType Type { get; init; }

    public string Path { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public ulong FileLength { get; init; }

    public Size Size { get; init; } = Size.Zero;
    public TimeSpan Duration { get; init; }

    public Guid OwnerId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
}