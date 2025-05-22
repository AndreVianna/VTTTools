namespace VttTools.Data.Library.Entities;

public class Scene {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid AdventureId { get; set; }
    public Adventure Adventure { get; set; } = null!;
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public Stage Stage { get; set; } = new();
    public List<SceneAsset> SceneAssets { get; set; } = [];
}