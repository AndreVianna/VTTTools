namespace VttTools.Library.Campaigns.Model;

public record Campaign {
    public World? World { get; init; }
    public Guid OwnerId { get; init; }
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public ResourceMetadata? Background { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public List<Adventure> Adventures { get; init; } = [];
}