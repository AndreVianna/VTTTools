
namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterSoundSourceUpdateData
    : Data {
    public Optional<string?> Name { get; init; }
    public Optional<Point> Position { get; init; }
    public Optional<float> Range { get; init; }
    public Optional<bool> IsPlaying { get; init; }
    public Optional<Guid?> ResourceId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Range.IsSet && Range.Value <= 0) {
            result += new Error("Range must be greater than 0.", nameof(Range));
        }
        return result;
    }
}