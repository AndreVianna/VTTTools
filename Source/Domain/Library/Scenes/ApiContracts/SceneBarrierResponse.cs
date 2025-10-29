using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ApiContracts;

public record SceneBarrierResponse {
    public Guid Id { get; init; }
    public Guid SceneId { get; init; }
    public Guid BarrierId { get; init; }
    public string BarrierName { get; init; } = string.Empty;
    public bool IsOpaque { get; init; }
    public bool IsSolid { get; init; }
    public bool IsSecret { get; init; }
    public bool IsOpenable { get; init; }
    public List<Point> Vertices { get; init; } = [];
    public bool? IsOpen { get; init; }
    public bool? IsLocked { get; init; }
}
