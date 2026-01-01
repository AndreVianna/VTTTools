namespace VttTools.Library.Stages.Model;

public record Stage {
    public const string NewStageName = "New Encounter";

    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }
    public string Name { get; init; } = NewStageName;
    public string Description { get; init; } = string.Empty;

    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }

    public StageSettings Settings { get; init; } = new();
    public Grid Grid { get; init; } = new();

    public IReadOnlyList<StageWall> Walls { get; init; } = [];
    public IReadOnlyList<StageRegion> Regions { get; init; } = [];
    public IReadOnlyList<StageLight> Lights { get; init; } = [];
    public IReadOnlyList<StageElement> Elements { get; init; } = [];
    public IReadOnlyList<StageSound> Sounds { get; init; } = [];
}