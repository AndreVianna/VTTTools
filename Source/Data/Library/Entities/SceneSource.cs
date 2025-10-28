using Point = VttTools.Common.Model.Point;

namespace VttTools.Data.Library.Entities;

public class SceneSource {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid SceneId { get; set; }
    public Scene Scene { get; set; } = null!;
    public Guid SourceId { get; set; }
    public Source Source { get; set; } = null!;
    public Point Position { get; set; } = Point.Zero;
    public decimal Range { get; set; } = 5.0m;
    public decimal Intensity { get; set; } = 1.0m;
    public bool IsGradient { get; set; } = true;
}
