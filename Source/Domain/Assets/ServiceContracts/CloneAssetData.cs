namespace VttTools.Assets.ServiceContracts;

public record CloneAssetData
    : Data {
    public Guid TemplateId { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<Shape> Shape { get; set; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the asset name cannot be null or empty.", nameof(Name));
        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the asset description cannot be null or empty.", nameof(Description));
        return result;
    }
}
