using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ServiceContracts;

public record AddSceneSourceData
    : Data {
    public string Name { get; init; } = string.Empty;
    public required string Type { get; init; }
    public required Point Position { get; init; }
    public float Direction { get; init; }
    public float? Range { get; init; }
    public float? Intensity { get; init; }
    public required bool HasGradient { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Type))
            result += new Error("Source type is required.", nameof(Type));
        if (Type.Length > 64)
            result += new Error("Source type must not exceed 64 characters.", nameof(Type));
        if (Range <= 0)
            result += new Error("Default range must be greater than 0.", nameof(Range));
        if (Intensity is < 0 or > 1.0f)
            result += new Error("Default intensity must be between 0.0 and 1.0.", nameof(Intensity));
        return result;
    }
}