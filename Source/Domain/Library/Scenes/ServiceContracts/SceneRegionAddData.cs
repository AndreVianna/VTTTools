
namespace VttTools.Library.Scenes.ServiceContracts;

public record SceneRegionAddData
    : Data {
    public string Name { get; init; } = string.Empty;
    public required string Type { get; init; }
    public required List<Point> Vertices { get; init; }
    public int? Value { get; init; }
    public string? Label { get; init; }
    public string? Color { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Type))
            result += new Error("Region type is required.", nameof(Type));
        if (Type.Length > 64)
            result += new Error("Region type must not exceed 64 characters.", nameof(Type));
        return result;
    }
}