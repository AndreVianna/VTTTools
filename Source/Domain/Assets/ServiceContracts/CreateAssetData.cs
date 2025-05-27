namespace VttTools.Assets.ServiceContracts;

/// <summary>
/// Data to create a new Asset template.
/// </summary>
public record CreateAssetData
    : Data {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public AssetType Type { get; init; }
    public Display Display { get; set; } = new();

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The asset name cannot be null or empty.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Description))
            result += new Error("The asset description cannot be null or empty.", nameof(Description));
        return result;
    }
}