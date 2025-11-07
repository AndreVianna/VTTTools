
namespace VttTools.Library.Scenes.ApiContracts;

public record SceneRegionAddRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public List<Point> Vertices { get; init; } = [];
    public int? Value { get; init; }
    public string? Label { get; init; }
    public string? Color { get; init; }
}