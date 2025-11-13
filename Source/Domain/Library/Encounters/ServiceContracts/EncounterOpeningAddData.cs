namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterOpeningAddData
    : Data {
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public required string Type { get; init; }

    public required uint WallIndex { get; init; }
    public required double CenterPosition { get; init; }

    public required double Width { get; init; }
    public required double Height { get; init; }

    public required OpeningVisibility Visibility { get; init; }
    public required OpeningState State { get; init; }
    public required OpeningOpacity Opacity { get; init; }

    public string? Material { get; init; }
    public string? Color { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (string.IsNullOrWhiteSpace(Name) || Name.Length > 128)
            result += new Error("Opening name must be between 1 and 128 characters.", nameof(Name));

        if (Description?.Length > 512)
            result += new Error("Opening description must not exceed 512 characters.", nameof(Description));

        if (string.IsNullOrWhiteSpace(Type) || Type.Length > 32)
            result += new Error("Opening type must be between 1 and 32 characters.", nameof(Type));

        if (CenterPosition < 0)
            result += new Error("Opening center position must be greater than or equal to 0.", nameof(CenterPosition));

        if (Width <= 0)
            result += new Error("Opening width must be greater than 0.", nameof(Width));

        if (Height <= 0)
            result += new Error("Opening height must be greater than 0.", nameof(Height));

        if (Width > 30)
            result += new Error("Opening width must not exceed 30 feet.", nameof(Width));

        if (Height > 30)
            result += new Error("Opening height must not exceed 30 feet.", nameof(Height));

        if (Material?.Length > 32)
            result += new Error("Opening material must not exceed 32 characters.", nameof(Material));

        if (Color?.Length > 16)
            result += new Error("Opening color must not exceed 16 characters.", nameof(Color));

        return result;
    }
}
