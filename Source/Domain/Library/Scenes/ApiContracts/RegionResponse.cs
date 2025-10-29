namespace VttTools.Library.Scenes.ApiContracts;

public record RegionResponse {
    public Guid Id { get; init; }
    public Guid OwnerId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string RegionType { get; init; } = string.Empty;
    public IReadOnlyDictionary<int, string> LabelMap { get; init; } = new Dictionary<int, string>();
    public DateTime CreatedAt { get; init; }
}
