using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ServiceContracts;

public record PlaceSceneRegionData {
    public Guid RegionId { get; init; }
    public List<Point> Vertices { get; init; } = [];
    public int Value { get; init; }
}