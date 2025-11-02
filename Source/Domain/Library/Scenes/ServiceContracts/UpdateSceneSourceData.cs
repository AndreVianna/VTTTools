
namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateSceneSourceData
    : Data {
    public Optional<string> Type { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<Point> Position { get; init; }
    public Optional<float> Direction { get; init; }
    public Optional<float?> Range { get; init; }
    public Optional<float?> Intensity { get; init; }
    public Optional<bool> HasGradient { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Range.IsSet && Range.Value.HasValue) {
            if (Range.Value.Value <= 0)
                result += new Error("Range must be greater than 0.", nameof(Range));
        }
        if (Intensity.IsSet && Intensity.Value.HasValue && (Intensity.Value.Value < 0 || Intensity.Value.Value > 1.0))
            result += new Error("Intensity must be between 0.0 and 1.0.", nameof(Intensity));
        return result;
    }
}