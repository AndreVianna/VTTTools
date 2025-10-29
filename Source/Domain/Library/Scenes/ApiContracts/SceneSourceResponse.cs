using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ApiContracts;

public record SceneSourceResponse {
    public Guid Id { get; init; }
    public Guid SceneId { get; init; }
    public Guid SourceId { get; init; }
    public Point Position { get; init; } = Point.Zero;
    public decimal Range { get; init; }
    public decimal Intensity { get; init; }
    public bool IsGradient { get; init; }
}
