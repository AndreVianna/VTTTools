namespace VttTools.Assets.ServiceContracts;

/// <summary>
/// Data to create a new Asset template.
/// </summary>
public record CreateAssetData
    : Data {
    public AssetKind Kind { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public AssetResource[] Resources { get; init; } = [];
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }

    // Polymorphic properties (only one should be provided based on Kind)
    public ObjectProperties? ObjectProps { get; init; }
    public CreatureProperties? CreatureProps { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The asset name cannot be null or empty.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Description))
            result += new Error("The asset description cannot be null or empty.", nameof(Description));

        // Validate that properties match the Kind
        if (Kind == AssetKind.Object && ObjectProps is null)
            result += new Error("ObjectProps must be provided for Object assets.", nameof(ObjectProps));
        if (Kind == AssetKind.Creature && CreatureProps is null)
            result += new Error("CreatureProps must be provided for Creature assets.", nameof(CreatureProps));

        // Validate ObjectProps values
        if (ObjectProps is not null) {
            if (ObjectProps.Size.Width <= 0)
                result += new Error("Size width must be greater than 0.", $"{nameof(ObjectProps)}.Size.Width");
            if (ObjectProps.Size.Height <= 0)
                result += new Error("Size height must be greater than 0.", $"{nameof(ObjectProps)}.Size.Height");
        }

        // Validate CreatureProps values
        if (CreatureProps is not null) {
            if (CreatureProps.Size.Width <= 0)
                result += new Error("Size width must be greater than 0.", $"{nameof(CreatureProps)}.Size.Width");
            if (CreatureProps.Size.Height <= 0)
                result += new Error("Size height must be greater than 0.", $"{nameof(CreatureProps)}.Size.Height");
        }

        return result;
    }
}