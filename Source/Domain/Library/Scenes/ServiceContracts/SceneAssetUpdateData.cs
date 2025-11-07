namespace VttTools.Library.Scenes.ServiceContracts;

public record SceneAssetUpdateData
    : Data {
    public Optional<string> Name { get; init; }

    public Optional<bool> IsLocked { get; set; }
    public Optional<bool> IsVisible { get; set; }

    public Optional<Frame> Frame { get; init; }
    public Optional<Guid?> TokenId { get; init; }
    public Optional<Guid?> PortraitId { get; init; }

    public Optional<Position> Position { get; init; }
    public Optional<NamedSize> Size { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }

    public Optional<Guid?> ControlledBy { get; set; }

    public Optional<string> Notes { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the asset name cannot be null or empty.", nameof(Name));
        if (Size.IsSet && Size.Value.Width < 0)
            result += new Error("When set, the asset width must be greater than 0.", nameof(Size));
        if (Size.IsSet && Size.Value.Height < 0)
            result += new Error("When set, the asset height must be greater than 0.", nameof(Size));
        if (Rotation is { IsSet: true, Value: < -180.0f or > 180.0f })
            result += new Error("When set, the asset rotation must be between -180 and 180.", nameof(Rotation));
        if (Elevation is { IsSet: true, Value: < -1000.0f or > 1000.0f })
            result += new Error("When set, the asset elevation must be between -1000 and 1000.", nameof(Elevation));
        return result;
    }
}