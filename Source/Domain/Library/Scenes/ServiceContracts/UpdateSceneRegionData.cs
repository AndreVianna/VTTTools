using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateSceneRegionData {
    public Optional<List<Point>> Vertices { get; init; }
    public Optional<int> Value { get; init; }
}