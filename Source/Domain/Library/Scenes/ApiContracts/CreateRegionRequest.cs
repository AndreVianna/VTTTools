namespace VttTools.Library.Scenes.ApiContracts;

public record CreateRegionRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [MaxLength(4096)]
    public string? Description { get; init; }
    [MaxLength(64)]
    public string RegionType { get; init; } = string.Empty;
    public Dictionary<int, string> LabelMap { get; init; } = [];
}
