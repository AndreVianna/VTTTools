using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.Model;

public record SceneSource {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid SceneId { get; init; }
    public Guid SourceId { get; init; }
    public Point Position { get; init; } = Point.Zero;
    public decimal Range { get; init; } = 5.0m;
    public decimal Intensity { get; init; } = 1.0m;
    public bool IsGradient { get; init; } = true;
}
