using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ApiContracts;

public record SceneRegionResponse {
    public string Name { get; init; } = string.Empty;
    public uint Index { get; init; }
    public string Type { get; init; } = string.Empty;
    public IReadOnlyList<Point> Vertices { get; init; } = [];
    public int? Value { get; init; }
    public string? Label { get; init; }
    public string? Color { get; init; }
}