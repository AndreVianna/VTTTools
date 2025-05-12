namespace VttTools.Library.Scenes.ServiceContracts;

public record AddSceneAssetData
    : Data {
    public Guid AssetId { get; init; }
    public Optional<string> Name { get; init; } = Optional<string>.None;
    public Optional<double> Scale { get; init; } = Optional<double>.None;
    public Optional<Position> Position { get; init; } = Optional<Position>.None;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the asset name cannot be null or empty.", nameof(Name));
        if (Scale is { IsSet: true, Value: <= 0 })
            result += new Error("When set, the asset scale must be greater than zero.", nameof(Scale));
        return result;
    }
}