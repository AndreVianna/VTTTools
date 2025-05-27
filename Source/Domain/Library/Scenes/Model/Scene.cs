namespace VttTools.Library.Scenes.Model;

public record Scene {
    public const string NewSceneName = "New Scene";

    public Guid Id { get; init; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; init; } = NewSceneName;
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    public bool IsPublished { get; set; }
    public Display Stage { get; init; } = new();
    public float ZoomLevel { get; init; } = 1.0f;
    public Grid Grid { get; init; } = new();
    public List<SceneAsset> Assets { get; init; } = [];
}