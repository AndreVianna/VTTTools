namespace VttTools.Library.Adventures.ApiContracts;

public record AdventureCardResponse {
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public AdventureStyle Style { get; init; }
    public bool IsOneShot { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public int EncounterCount { get; init; }
    public Guid? BackgroundId { get; init; }

    public static AdventureCardResponse FromAdventure(Adventure adventure) => new() {
        Id = adventure.Id,
        Name = adventure.Name,
        Description = adventure.Description,
        Style = adventure.Style,
        IsOneShot = adventure.IsOneShot,
        IsPublished = adventure.IsPublished,
        IsPublic = adventure.IsPublic,
        EncounterCount = adventure.Encounters.Count,
        BackgroundId = adventure.Background?.Id,
    };
}
