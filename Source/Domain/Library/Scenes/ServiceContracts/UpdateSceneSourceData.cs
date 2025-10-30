using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateSceneSourceData
    : Data {
    public Optional<Point> Position { get; init; }
    public Optional<decimal?> Range { get; init; }
    public Optional<decimal?> Intensity { get; init; }
    public Optional<bool?> IsGradient { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Range.IsSet && Range.Value.HasValue) {
            if (Range.Value.Value <= 0)
                result += new Error("Range must be greater than 0.", nameof(Range));
            if (Range.Value.Value > 99.99m)
                result += new Error("Range must not exceed 99.99.", nameof(Range));
        }
        if (Intensity.IsSet && Intensity.Value.HasValue && (Intensity.Value.Value < 0 || Intensity.Value.Value > 1.0m))
            result += new Error("Intensity must be between 0.0 and 1.0.", nameof(Intensity));
        return result;
    }
}