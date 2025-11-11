
namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterSourceAddData
    : Data {
    public string Name { get; init; } = string.Empty;
    public required string Type { get; init; }
    public required Point Position { get; init; }
    public bool IsDirectional { get; init; }
    public float Direction { get; init; }
    public float Range { get; init; }
    public float Spread { get; init; }
    public bool HasGradient { get; init; }
    public float Intensity { get; init; }
    public string? Color { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Type))
            result += new Error("Source type is required.", nameof(Type));
        if (Type.Length > 64)
            result += new Error("Source type must not exceed 64 characters.", nameof(Type));
        if (Range <= 0)
            result += new Error("Default range must be greater than 0.", nameof(Range));
        return result;
    }
}