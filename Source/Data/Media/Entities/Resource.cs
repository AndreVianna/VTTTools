namespace VttTools.Data.Media.Entities;

public class Resource {
    public Guid Id { get; set; }

    [MaxLength(1024)]
    public string? Description { get; init; }

    public ResourceType ResourceType { get; set; }
    public ResourceClassification Classification { get; set; } = new();

    [MaxLength(64)]
    public string ContentType { get; set; } = string.Empty;
    [MaxLength(512)]
    public string Path { get; set; } = string.Empty;
    [MaxLength(128)]
    public string FileName { get; set; } = string.Empty;
    public ulong FileLength { get; set; }

    public Size Size { get; set; } = Size.Zero;
    public TimeSpan Duration { get; set; } = TimeSpan.Zero;

    public ICollection<ResourceFeature> Features { get; set; } = [];

    public Guid OwnerId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
}
