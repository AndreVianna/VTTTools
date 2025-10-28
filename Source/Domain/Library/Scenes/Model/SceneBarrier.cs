using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.Model;

public record SceneBarrier {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid SceneId { get; init; }
    public Guid BarrierId { get; init; }
    public IReadOnlyList<Point> Vertices { get; init; } = [];
    public bool? IsOpen { get; init; }
    public bool? IsLocked { get; init; }
}
