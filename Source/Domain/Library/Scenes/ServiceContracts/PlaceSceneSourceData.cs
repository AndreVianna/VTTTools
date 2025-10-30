using Point = VttTools.Common.Model.Point;

namespace VttTools.Library.Scenes.ServiceContracts;

public record PlaceSceneSourceData
    : Data {
    public Guid SourceId { get; init; }
    public Point Position { get; init; } = Point.Zero;
    public decimal? Range { get; init; }
    public decimal? Intensity { get; init; }
    public bool? IsGradient { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (SourceId == Guid.Empty)
            result += new Error("Source ID is required.", nameof(SourceId));
        if (Range.HasValue) {
            if (Range.Value <= 0)
                result += new Error("Range must be greater than 0.", nameof(Range));
            if (Range.Value > 99.99m)
                result += new Error("Range must not exceed 99.99.", nameof(Range));
        }
        if (Intensity.HasValue && (Intensity.Value < 0 || Intensity.Value > 1.0m))
            result += new Error("Intensity must be between 0.0 and 1.0.", nameof(Intensity));
        return result;
    }
}