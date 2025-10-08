namespace VttTools.Assets.ServiceContracts;

public record UpdateAssetData
    : Data {
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<Guid> ResourceId { get; init; }
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
            if (ObjectProps.Value.CellWidth <= 0)
                result += new Error("CellWidth must be greater than 0.", $"{nameof(ObjectProps)}.{nameof(ObjectProps.Value.CellWidth)}");
            if (ObjectProps.Value.CellHeight <= 0)
                result += new Error("CellHeight must be greater than 0.", $"{nameof(ObjectProps)}.{nameof(ObjectProps.Value.CellHeight)}");
        }

        // Validate CreatureProps values if being updated
        if (CreatureProps.IsSet && CreatureProps.Value is not null) {
            if (CreatureProps.Value.CellSize <= 0)
                result += new Error("CellSize must be greater than 0.", $"{nameof(CreatureProps)}.{nameof(CreatureProps.Value.CellSize)}");
        }

        return result;
    }
}