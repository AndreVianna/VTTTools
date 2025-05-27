namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateAssetData
    : Data {
    public Optional<string> Name { get; init; }
    public Optional<Display> Display { get; init; }
    public Optional<Point> Position { get; init; }
    public Optional<float> Scale { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
    public Optional<bool> IsLocked { get; set; }
    public Optional<Guid?> ControlledBy { get; set; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the asset name cannot be null or empty.", nameof(Name));
        if (Scale is { IsSet: true, Value: < 0.1f or > 10.0f })
            result += new Error("When set, the asset scale must be between 0.1 and 10.", nameof(Scale));
        if (Rotation is { IsSet: true, Value: < -180.0f or > 180.0f })
            result += new Error("When set, the asset rotation must be between -180 and 180.", nameof(Rotation));
        if (Elevation is { IsSet: true, Value: < -1000.0f or > 1000.0f })
            result += new Error("When set, the asset elevation must be between -1000 and 1000.", nameof(Elevation));
        return result;
    }
}