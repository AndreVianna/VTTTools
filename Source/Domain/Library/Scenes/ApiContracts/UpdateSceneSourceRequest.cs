using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneSourceRequest {
    public Point? Position { get; init; }
    public decimal? Range { get; init; }
    public decimal? Intensity { get; init; }
    public bool? IsGradient { get; init; }
}