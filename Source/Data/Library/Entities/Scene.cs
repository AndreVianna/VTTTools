using Resource = VttTools.Data.Resources.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class Scene {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid? AdventureId { get; set; }
    public Adventure? Adventure { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public Point Offset { get; set; }
    public float ZoomLevel { get; set; } = 1.0f;
    public Guid StageId { get; set; }
    public Resource Stage { get; set; } = new();
    public Grid Grid { get; set; } = new();
    public ICollection<SceneAsset> SceneAssets { get; set; } = [];
}