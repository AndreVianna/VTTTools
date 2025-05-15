namespace VttTools.Library.Scenes.ServiceContracts;

public record AddClonedAssetData
    : CloneAssetData {
    public Optional<double> Scale { get; init; } = Optional<double>.None;
    public Optional<Position> Position { get; init; } = Optional<Position>.None;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Scale is { IsSet: true, Value: < 0.1d or > 10.0d })
            result += new Error("When set, the asset scale must be between 0.1 and 10.", nameof(Scale));
        return result;
    }
}
