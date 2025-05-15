namespace VttTools.Library.Scenes.ServiceContracts;

public record AddAssetData
    : Data {
    public Guid AssetId { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<AssetDisplay> Display { get; set; }
    public Optional<double> Scale { get; init; }
    public Optional<Position> Position { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the asset name cannot be null or empty.", nameof(Name));
        if (Scale is { IsSet: true, Value: < 0.1d or > 10.0d })
            result += new Error("When set, the asset scale must be between 0.1 and 10.", nameof(Scale));
        return result;
    }
}
