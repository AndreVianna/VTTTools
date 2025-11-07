namespace VttTools.Assets.ServiceContracts;

public record CreatureData {
    public Guid? StatBlockId { get; init; }
    public CreatureCategory Category { get; init; } = CreatureCategory.Character;
    public TokenStyle? TokenStyle { get; init; }
}

public record ObjectData {
    public bool IsMovable { get; init; } = true;
    public bool IsOpaque { get; init; }
    public Guid? TriggerEffectId { get; init; }
}

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
    public CreatureData? CreatureData { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The asset name cannot be null or empty.", nameof(Name));
        // Description is optional per domain model - removed validation

        // Validate that properties match the Kind
        if (Kind == AssetKind.Object && ObjectData is null)
            result += new Error("ObjectData must be provided for Object assets.", nameof(ObjectData));
        if (Kind == AssetKind.Creature && CreatureData is null)
            result += new Error("CreatureData must be provided for Creature assets.", nameof(CreatureData));

        // Validate Size values
        if (Size.Width <= 0)
            result += new Error("Size width must be greater than 0.", $"{nameof(Size)}.{nameof(Size.Width)}");
        if (Size.Height <= 0)
            result += new Error("Size height must be greater than 0.", $"{nameof(Size)}.{nameof(Size.Height)}");

        return result;
    }
}