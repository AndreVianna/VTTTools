using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.Model;

public record SceneRegion {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid SceneId { get; init; }
    public Guid RegionId { get; init; }
    public IReadOnlyList<Point> Vertices { get; init; } = [];
    public int Value { get; init; }
}
