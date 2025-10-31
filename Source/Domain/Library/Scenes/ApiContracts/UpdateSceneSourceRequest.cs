using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneSourceRequest {
    [MaxLength(128)]
    public Optional<string> Name { get; init; } = string.Empty;
    [MaxLength(32)]
    public Optional<string> Type { get; init; } = string.Empty;
    public Optional<Point> Position { get; init; }
    public Optional<float> Direction { get; init; }
    public Optional<float?> Range { get; init; }
    public Optional<float?> Intensity { get; init; }
    public Optional<bool> HasGradient { get; init; }
}