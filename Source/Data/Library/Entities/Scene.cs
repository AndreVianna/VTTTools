using Point = VttTools.Common.Model.Point;
using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Library.Entities;

public class Scene {
    public Guid? AdventureId { get; set; }
    public Adventure? Adventure { get; set; }
    public Guid OwnerId { get; set; }
    public Guid Id { get; set; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public Point Panning { get; set; } = Point.Zero;
    public float ZoomLevel { get; set; } = 1;
    public Guid StageId { get; set; }
    public Resource Stage { get; set; } = null!;
    public Grid Grid { get; set; } = new();
    public ICollection<SceneAsset> SceneAssets { get; set; } = [];
}