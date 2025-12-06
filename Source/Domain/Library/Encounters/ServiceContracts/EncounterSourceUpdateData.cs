
namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterLightSourceUpdateData
    : Data {
    public Optional<LightSourceType> Type { get; init; }
    public Optional<string?> Name { get; init; }
    public Optional<Point> Position { get; init; }
    public Optional<float> Range { get; init; }
    public Optional<float?> Direction { get; init; }
    public Optional<float?> Arc { get; init; }
    public Optional<string?> Color { get; init; }
    public Optional<bool> IsOn { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Range.IsSet && Range.Value <= 0) {
            result += new Error("Range must be greater than 0.", nameof(Range));
        }
        return result;
    }
}