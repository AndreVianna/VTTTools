namespace VttTools.Library.Adventures.Model;

public record Adventure {
    public World? World { get; init; }
    public Campaign? Campaign { get; init; }
    public Guid OwnerId { get; init; }
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public string Name { get; init; } = string.Empty;
    public AdventureStyle Style { get; init; }
    public string Description { get; init; } = string.Empty;
    public ResourceMetadata? Background { get; init; }
    public bool IsOneShot { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public List<Encounter> Encounters { get; init; } = [];
}