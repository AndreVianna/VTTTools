namespace VttTools.Library.Scenes.Model;

public class Scene {
    public Guid AdventureId { get; set; }
    public Adventure Adventure { get; set; } = null!;
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public bool IsListed { get; set; }
    public bool IsPublic { get; set; }
    public Stage Stage { get; set; } = new();
    public List<SceneAsset> SceneAssets { get; set; } = [];
}