namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterOpeningUpdateData
    : Data {
    public Optional<string> Name { get; init; }
    public Optional<string?> Description { get; init; }
    public Optional<string> Type { get; init; }

    public Optional<double> Width { get; init; }
    public Optional<double> Height { get; init; }

    public Optional<OpeningVisibility> Visibility { get; init; }
    public Optional<OpeningState> State { get; init; }
    public Optional<OpeningOpacity> Opacity { get; init; }

    public Optional<string?> Material { get; init; }
    public Optional<string?> Color { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (Name.IsSet && (string.IsNullOrWhiteSpace(Name.Value) || Name.Value.Length > 128))
            result += new Error("Opening name must be between 1 and 128 characters.", nameof(Name));

        if (Description.IsSet && Description.Value?.Length > 512)
            result += new Error("Opening description must not exceed 512 characters.", nameof(Description));

        if (Type.IsSet && (string.IsNullOrWhiteSpace(Type.Value) || Type.Value.Length > 32))
            result += new Error("Opening type must be between 1 and 32 characters.", nameof(Type));

        if (Width.IsSet && Width.Value <= 0)
            result += new Error("Opening width must be greater than 0.", nameof(Width));

        if (Height.IsSet && Height.Value <= 0)
            result += new Error("Opening height must be greater than 0.", nameof(Height));

        if (Width.IsSet && Width.Value > 30)
            result += new Error("Opening width must not exceed 30 feet.", nameof(Width));

        if (Height.IsSet && Height.Value > 30)
            result += new Error("Opening height must not exceed 30 feet.", nameof(Height));

        if (Material.IsSet && Material.Value?.Length > 32)
            result += new Error("Opening material must not exceed 32 characters.", nameof(Material));

        if (Color.IsSet && Color.Value?.Length > 16)
            result += new Error("Opening color must not exceed 16 characters.", nameof(Color));

        return result;
    }
}
