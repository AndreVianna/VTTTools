namespace VttTools.Assets.ServiceContracts;

public record UpdateAssetData
    : Data {
    public Optional<AssetKind> Kind { get; init; }
    public Optional<string> Category { get; init; }
    public Optional<string> Type { get; init; }
    public Optional<string> Subtype { get; init; }

    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<ListPatcher<string>> Tags { get; init; }

    public Optional<Guid?> PortraitId { get; init; }
    public Optional<NamedSize> TokenSize { get; init; }

    public Optional<bool> IsPublished { get; set; }
    public Optional<bool> IsPublic { get; set; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Category.IsSet && string.IsNullOrWhiteSpace(Category.Value))
            result += new Error("The asset category cannot be null or empty.", nameof(Category));
        if (Category.IsSet && Category.Value.Length > 32)
            result += new Error("The asset category cannot have more than 32 characters.", nameof(Category));
        if (Type.IsSet && string.IsNullOrWhiteSpace(Type.Value))
            result += new Error("The asset type cannot be null or empty.", nameof(Type));
        if (Type.IsSet && Type.Value.Length > 32)
            result += new Error("The asset type cannot have more than 32 characters.", nameof(Type));
        if (Subtype.IsSet &&  Subtype.Value.Length > 32)
            result += new Error("The asset subtype cannot have more than 32 characters.", nameof(Subtype));
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the asset name cannot be null or empty.", nameof(Name));
        if (Name.IsSet && Name.Value.Length > 128)
            result += new Error("The asset name cannot have more than 128 characters.", nameof(Name));
        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("The asset description cannot be null or empty.", nameof(Description));
        if (TokenSize.IsSet && TokenSize.Value.Width <= 0)
            result += new Error("When set, the size width must be greater than 0.", $"{nameof(TokenSize)}.{nameof(TokenSize.Value.Width)}");
        if (TokenSize.IsSet && TokenSize.Value.Height <= 0)
            result += new Error("When set, the size height must be greater than 0.", $"{nameof(TokenSize)}.{nameof(TokenSize.Value.Height)}");

        return result;
    }
}