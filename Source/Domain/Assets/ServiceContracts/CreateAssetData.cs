namespace VttTools.Assets.ServiceContracts;

/// <summary>
/// Data to create a new Asset template.
/// </summary>
public record CreateAssetData
    : Data {
    public AssetKind Kind { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// Full image for details and stat blocks.
    /// </summary>
    public Guid? PortraitId { get; init; }

    /// <summary>
    /// Bird's eye view token image.
    /// </summary>
    public Guid? TopDownId { get; init; }

    /// <summary>
    /// Isometric view token image.
    /// </summary>
    public Guid? MiniatureId { get; init; }

    /// <summary>
    /// Face view image with frame (not applicable for objects).
    /// </summary>
    public Guid? PhotoId { get; init; }

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

        if (Kind == AssetKind.Object && ObjectData is null)
            result += new Error("ObjectData must be provided for Object assets.", nameof(ObjectData));
        if (Kind == AssetKind.Monster && MonsterData is null)
            result += new Error("MonsterData must be provided for Monster assets.", nameof(MonsterData));
        if (Kind == AssetKind.Character && CharacterData is null)
            result += new Error("CharacterData must be provided for Character assets.", nameof(CharacterData));

        if (Size.Width <= 0)
            result += new Error("Size width must be greater than 0.", $"{nameof(Size)}.{nameof(Size.Width)}");
        if (Size.Height <= 0)
            result += new Error("Size height must be greater than 0.", $"{nameof(Size)}.{nameof(Size.Height)}");

        return result;
    }
}