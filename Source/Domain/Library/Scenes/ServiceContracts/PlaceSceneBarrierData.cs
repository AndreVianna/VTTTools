using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ServiceContracts;

public record PlaceSceneBarrierData {
    public Guid BarrierId { get; init; }
    public List<Point> Vertices { get; init; } = [];
    public bool? IsOpen { get; init; }
    public bool? IsLocked { get; init; }
}
