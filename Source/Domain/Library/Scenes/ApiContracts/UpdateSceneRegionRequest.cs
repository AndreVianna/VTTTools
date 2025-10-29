using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneRegionRequest {
    public Optional<List<Point>> Vertices { get; init; }
    public Optional<int> Value { get; init; }
}
