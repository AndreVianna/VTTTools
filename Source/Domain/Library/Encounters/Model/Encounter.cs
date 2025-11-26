namespace VttTools.Library.Encounters.Model;

public record Encounter {
    public const string NewEncounterName = "New Encounter";

    public Adventure Adventure { get; init; } = null!;
    public Guid Id { get; init; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; init; } = NewEncounterName;
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    public bool IsPublished { get; set; }
    public Stage Stage { get; set; } = new();
    public Grid Grid { get; init; } = new();
    public List<EncounterAsset> Assets { get; init; } = [];
    public List<EncounterWall> Walls { get; init; } = [];
    public List<EncounterOpening> Openings { get; init; } = [];
    public List<EncounterRegion> Regions { get; init; } = [];
    public List<EncounterSource> Sources { get; init; } = [];
}