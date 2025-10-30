using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ApiContracts;

public record PlaceSceneRegionRequest {
    public Guid RegionId { get; init; }
    public List<Point> Vertices { get; init; } = [];
    public int Value { get; init; }
}