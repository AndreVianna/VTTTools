namespace VttTools.Library.Scenes.Model;

public record Scene {
    public const string NewSceneName = "New Scene";

    public Adventure Adventure { get; init; } = null!;
    public Guid Id { get; init; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; init; } = NewSceneName;
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    public bool IsPublished { get; set; }
    public Stage Stage { get; set; } = new();
    public Grid Grid { get; init; } = new();
    public List<SceneAsset> Assets { get; init; } = [];
    public List<SceneWall> Walls { get; init; } = [];
    public List<SceneRegion> Regions { get; init; } = [];
    public List<SceneSource> Sources { get; init; } = [];
    public List<SceneEffect> Effects { get; init; } = [];

    /// <summary>
    /// Default display mode for creature labels in this scene.
    /// </summary>
    public DisplayName DefaultDisplayName { get; init; } = DisplayName.Always;

    /// <summary>
    /// Default label position for all assets in this scene.
    /// </summary>
    public LabelPosition DefaultLabelPosition { get; init; } = LabelPosition.Bottom;
}