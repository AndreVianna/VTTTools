namespace VttTools.Library.Worlds.Model;

public record World {
    public Guid OwnerId { get; init; }
    public Guid Id { get; init; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    public ResourceInfo? Background { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public List<Campaign> Campaigns { get; init; } = [];
    public List<Adventure> Adventures { get; init; } = [];
}