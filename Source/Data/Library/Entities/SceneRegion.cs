using Point = VttTools.Common.Model.Point;

namespace VttTools.Data.Library.Entities;

public class SceneRegion {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid SceneId { get; set; }
    public Scene Scene { get; set; } = null!;
    public Guid RegionId { get; set; }
    public Region Region { get; set; } = null!;
    public List<Point> Vertices { get; set; } = [];
    public int Value { get; set; }
}
