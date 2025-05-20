namespace VttTools.Library.Epics.Model;

public record Epic {
    public Guid OwnerId { get; init; }
    public Guid Id { get; init; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    public Guid? ImageId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public List<Campaign> Campaigns { get; init; } = [];
}