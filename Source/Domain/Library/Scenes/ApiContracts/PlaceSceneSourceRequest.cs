using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ApiContracts;

public record PlaceSceneSourceRequest {
    public Guid SourceId { get; init; }
    public Point Position { get; init; } = Point.Zero;
    public decimal? Range { get; init; }
    public decimal? Intensity { get; init; }
    public bool? IsGradient { get; init; }
}