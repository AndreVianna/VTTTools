using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.Model;

public record SceneSource {
    public uint Index { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(32)]
    public string Type { get; init; } = string.Empty;
    public Point Position { get; set; } = Point.Zero;
    public float Direction { get; init; }
    public float? Range { get; init; }
    public float? Intensity { get; init; }
    public bool HasGradient { get; init; }
}