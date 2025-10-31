using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateSceneRegionData {
    public Optional<string> Type { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<List<Point>> Vertices { get; init; }
    public Optional<int?> Value { get; init; }
    public Optional<string?> Label { get; init; }
    public Optional<string?> Color { get; init; }
}