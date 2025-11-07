
namespace VttTools.Library.Scenes.ApiContracts;

public record SceneRegionUpdateRequest {
    [MaxLength(128)]
    public Optional<string> Name { get; init; } = string.Empty;
    [MaxLength(32)]
    public Optional<string> Type { get; init; } = string.Empty;
    public Optional<List<Point>> Vertices { get; init; }
    public Optional<int?> Value { get; init; }
    public Optional<string?> Label { get; init; }
    public Optional<string?> Color { get; init; }
}