using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.Model;

public record SceneRegion {
    public uint Index { get; init; }
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(32)]
    public string Type { get; init; } = string.Empty;
    public IReadOnlyList<Point> Vertices { get; init; } = [];
    public int? Value { get; init; }
    [MaxLength(32)]
    public string? Label { get; init; }
    [MaxLength(16)]
    public string? Color { get; init; }
}