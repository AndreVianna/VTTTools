
namespace VttTools.Library.Scenes.ServiceContracts;

public record SceneSourceUpdateData
    : Data {
    public Optional<string> Type { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<Point> Position { get; init; }
    public Optional<bool> IsDirectional { get; init; }
    public Optional<float> Direction { get; init; }
    public Optional<float> Range { get; init; }
    public Optional<float> Spread { get; init; }
    public Optional<float> Intensity { get; init; }
    public Optional<string?> Color { get; init; }
    public Optional<bool> HasGradient { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Type.IsSet && string.IsNullOrWhiteSpace(Type.Value))
            result += new Error("Source type is required.", nameof(Type));
        if (Type.IsSet && Type.Value.Length > 64)
            result += new Error("Source type must not exceed 64 characters.", nameof(Type));
        if (Range.IsSet && Range.Value <= 0) {
            result += new Error("Range must be greater than 0.", nameof(Range));
        }
        return result;
    }
}