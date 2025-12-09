
namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterLightAddData
    : Data {
    public string? Name { get; init; }
    public required LightSourceType Type { get; init; }
    public required Point Position { get; init; }
    public float Range { get; init; }
    public float? Direction { get; init; }
    public float? Arc { get; init; }
    public string? Color { get; init; }
    public bool IsOn { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Range <= 0)
            result += new Error("Source range must be greater than 0.", nameof(Range));
        return result;
    }
}