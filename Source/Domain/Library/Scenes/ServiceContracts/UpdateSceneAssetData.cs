namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateSceneAssetData
    : Data {
    public Guid AssetId { get; init; }
    public uint Number { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<double> Scale { get; init; }
    public Optional<Position> Position { get; init; }
    public Optional<bool> IsLocked { get; set; }
    public Optional<Guid?> ControlledBy { get; set; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the asset name cannot be null or empty.", nameof(Name));
        if (Scale is { IsSet: true, Value: <= 0 })
            result += new Error("When set, the asset scale must be greater than zero.", nameof(Scale));
        return result;
    }
}