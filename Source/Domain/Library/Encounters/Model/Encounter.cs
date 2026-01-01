namespace VttTools.Library.Encounters.Model;

public record Encounter {
    public Adventure Adventure { get; init; } = null!;

    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }

    public Stage Stage { get; init; } = null!;

    public List<EncounterActor> Actors { get; init; } = [];
    public List<EncounterObject> Objects { get; init; } = [];
    public List<EncounterEffect> Effects { get; init; } = [];
}