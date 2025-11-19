namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterAssetAddData
    : Data {
    public string? Name { get; init; }
    public bool IsVisible { get; init; }

    public Frame Frame { get; init; } = new Frame();

    /// <summary>
    /// Single image reference for this asset instance.
    /// </summary>
    public Guid? ImageId { get; init; }

    public NamedSize Size { get; init; } = NamedSize.Zero;
    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    public string? Notes { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
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