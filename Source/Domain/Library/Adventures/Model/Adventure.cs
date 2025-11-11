namespace VttTools.Library.Adventures.Model;

public record Adventure {
    public World? World { get; init; }
    public Campaign? Campaign { get; init; }
    public Guid OwnerId { get; init; }
    public Guid Id { get; init; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public AdventureStyle Style { get; init; }
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    public Resource? Background { get; init; }
    public bool IsOneShot { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public List<Encounter> Encounters { get; init; } = [];
}