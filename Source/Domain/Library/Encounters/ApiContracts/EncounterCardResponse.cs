namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterCardResponse {
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public Guid? BackgroundId { get; init; }

    public static EncounterCardResponse FromEncounter(Encounter encounter) => new() {
        Id = encounter.Id,
        Name = encounter.Name ?? encounter.Stage.Name,
        Description = encounter.Description ?? encounter.Stage.Description,
        IsPublished = encounter.IsPublished,
        IsPublic = encounter.IsPublic,
        BackgroundId = encounter.Stage.Settings.MainBackground?.Id,
    };
}
