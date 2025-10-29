using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateSceneBarrierData {
    public Optional<List<Point>> Vertices { get; init; }
    public Optional<bool?> IsOpen { get; init; }
    public Optional<bool?> IsLocked { get; init; }
}
