namespace VttTools.Assets.ServiceContracts;

/// <summary>
/// Data to create a new Asset template.
/// </summary>
public record CreateAssetData
    : Data {
    public AssetKind Kind { get; init; }

    public required string Category {
        get;
        init => field = value.Trim();
    }

    public required string Type {
        get;
        init => field = value.Trim();
    }

    public string? Subtype {
        get;
        init => field = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    public string Name {
        get;
        init => field = value.Trim();
    } = string.Empty;

    public string Description {
        get;
        init => field = value.Trim();
    } = string.Empty;

    public Guid? PortraitId { get; init; }
    public NamedSize TokenSize { get; init; } = NamedSize.Default;
    public Guid? TokenId { get; init; }

    public string[] Tags { get; init; } = [];

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (string.IsNullOrWhiteSpace(Category))
            result += new Error("The asset category cannot be null or empty.", nameof(Category));
        if (Category.Length > 32)
            result += new Error("The asset category cannot have more than 32 characters.", nameof(Category));
        if (string.IsNullOrWhiteSpace(Type))
            result += new Error("The asset type cannot be null or empty.", nameof(Type));
        if (Type.Length > 32)
            result += new Error("The asset type cannot have more than 32 characters.", nameof(Type));
        if (Subtype?.Length > 32)
            result += new Error("The asset subtype cannot have more than 32 characters.", nameof(Subtype));
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The asset name cannot be null or empty.", nameof(Name));
        if (Name.Length > 128)
            result += new Error("The asset name cannot have more than 128 characters.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Description))
            result += new Error("The asset description cannot be null or empty.", nameof(Description));
        if (TokenSize.Width <= 0)
            result += new Error("TokenSize width must be greater than 0.", $"{nameof(TokenSize)}.{nameof(TokenSize.Width)}");
        if (TokenSize.Height <= 0)
            result += new Error("TokenSize height must be greater than 0.", $"{nameof(TokenSize)}.{nameof(TokenSize.Height)}");

        return result;
    }
}