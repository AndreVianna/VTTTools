using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneBarrierRequest {
    public Optional<List<Point>> Vertices { get; init; }
    public Optional<bool?> IsOpen { get; init; }
    public Optional<bool?> IsLocked { get; init; }
}
