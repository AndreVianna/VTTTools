namespace VttTools.Library.Scenes.Model;

public record Scene {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    public Stage Stage { get; init; } = new();
    public List<SceneAsset> SceneAssets { get; init; } = [];
}