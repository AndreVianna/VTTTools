namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateRegionData
    : Data {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; init; }
    [MaxLength(64)]
    public string RegionType { get; init; } = string.Empty;
    public Dictionary<int, string> LabelMap { get; init; } = [];

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Region name is required.", nameof(Name));
        if (Name.Length > 128)
            result += new Error("Region name must not exceed 128 characters.", nameof(Name));
        if (Description?.Length > 4096)
            result += new Error("Region description must not exceed 4096 characters.", nameof(Description));
        if (string.IsNullOrWhiteSpace(RegionType))
            result += new Error("Region type is required.", nameof(RegionType));
        if (RegionType.Length > 64)
            result += new Error("Region type must not exceed 64 characters.", nameof(RegionType));
        if (LabelMap is null || LabelMap.Count == 0)
            result += new Error("Region must have at least one label entry.", nameof(LabelMap));
        return result;
    }
}
