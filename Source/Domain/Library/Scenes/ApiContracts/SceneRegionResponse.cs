using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ApiContracts;

public record SceneRegionResponse {
    public Guid Id { get; init; }
    public Guid SceneId { get; init; }
    public Guid RegionId { get; init; }
    public IReadOnlyList<Point> Vertices { get; init; } = [];
    public int Value { get; init; }
}
