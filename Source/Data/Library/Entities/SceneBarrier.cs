using Point = VttTools.Common.Model.Point;

namespace VttTools.Data.Library.Entities;

public class SceneBarrier {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid SceneId { get; set; }
    public Scene Scene { get; set; } = null!;
    public Guid BarrierId { get; set; }
    public Barrier Barrier { get; set; } = null!;
    public List<Point> Vertices { get; set; } = [];
    public bool? IsOpen { get; set; }
    public bool? IsLocked { get; set; }
}
