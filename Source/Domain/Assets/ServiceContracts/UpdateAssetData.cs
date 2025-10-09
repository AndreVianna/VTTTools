namespace VttTools.Assets.ServiceContracts;

public record UpdateAssetData
    : Data {
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<AssetResource[]> Resources { get; init; }  // Replace entire Resources collection when set
    public Optional<bool> IsPublished { get; set; }
    public Optional<bool> IsPublic { get; set; }

    // Polymorphic properties (provide the one matching the asset's Kind)
    public Optional<ObjectProperties> ObjectProps { get; init; }
    public Optional<CreatureProperties> CreatureProps { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the asset name cannot be null or empty.", nameof(Name));
        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the asset description cannot be null or empty.", nameof(Description));

        // Validate ObjectProps values if being updated
        if (ObjectProps.IsSet && ObjectProps.Value is not null) {
            if (ObjectProps.Value.Size.Width <= 0)
                result += new Error("Size width must be greater than 0.", $"{nameof(ObjectProps)}.Size.Width");
            if (ObjectProps.Value.Size.Height <= 0)
                result += new Error("Size height must be greater than 0.", $"{nameof(ObjectProps)}.Size.Height");
        }

        // Validate CreatureProps values if being updated
        if (CreatureProps.IsSet && CreatureProps.Value is not null) {
            if (CreatureProps.Value.Size.Width <= 0)
                result += new Error("Size width must be greater than 0.", $"{nameof(CreatureProps)}.Size.Width");
            if (CreatureProps.Value.Size.Height <= 0)
                result += new Error("Size height must be greater than 0.", $"{nameof(CreatureProps)}.Size.Height");
        }

        return result;
    }
}