namespace VttTools.Media.ApiContracts;

public record UpdateResourceRequest
    : Request {
    public Optional<string?> Description { get; init; }
    public Optional<ResourceClassification> Classification { get; init; }
    public Optional<Map<HashSet<string>>> Features { get; init; }
    public Optional<bool> IsPublic { get; init; }
    public Optional<bool> IsPublished { get; init; }
}