namespace VttTools.Library.Scenes.ServiceContracts;

public record AddSceneAssetData
    : Data {
    // Overridable properties
    public Optional<string> Name { get; init; } = string.Empty;
    public Optional<string> Description { get; init; }
    public Optional<Guid> ResourceId { get; init; }

    // Instance-specific properties
    public Size Size { get; init; } = Size.Zero;
    public Frame? Frame { get; init; }
    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the name cannot be null or empty.", nameof(Name));
        if (Size.Width < 0)
            result += new Error("The width must be greater than 0.", nameof(Size));
        if (Size.Height < 0)
            result += new Error("The height must be greater than 0.", nameof(Size));
        if (Rotation is < -180 or > 180)
            result += new Error("The rotation must be between -180 and 180.", nameof(Rotation));
        if (Elevation is < -1000 or > 1000)
            result += new Error("The elevation must be between -1000 and 1000.", nameof(Elevation));
        return result;
    }
}