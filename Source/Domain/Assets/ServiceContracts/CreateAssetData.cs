namespace VttTools.Assets.ServiceContracts;

/// <summary>
/// Data to create a new Asset template.
/// </summary>
public record CreateAssetData
    : Data {
    public AssetKind Kind { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public AssetTokenData[] Tokens { get; init; } = [];
    public Guid? PortraitId { get; init; }
    public NamedSize Size { get; init; } = NamedSize.Default;
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }

    public ObjectData? ObjectData { get; init; }
    public MonsterData? MonsterData { get; init; }
    public CharacterData? CharacterData { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The asset name cannot be null or empty.", nameof(Name));
        // Description is optional per domain model - removed validation

        // Validate that properties match the Kind
        if (Kind == AssetKind.Object && ObjectData is null)
            result += new Error("ObjectData must be provided for Object assets.", nameof(ObjectData));
        if (Kind == AssetKind.Monster && MonsterData is null)
            result += new Error("MonsterData must be provided for Monster assets.", nameof(MonsterData));
        if (Kind == AssetKind.Character && CharacterData is null)
            result += new Error("CharacterData must be provided for Character assets.", nameof(CharacterData));

        // Validate Size values
        if (Size.Width <= 0)
            result += new Error("Size width must be greater than 0.", $"{nameof(Size)}.{nameof(Size.Width)}");
        if (Size.Height <= 0)
            result += new Error("Size height must be greater than 0.", $"{nameof(Size)}.{nameof(Size.Height)}");

        return result;
    }
}