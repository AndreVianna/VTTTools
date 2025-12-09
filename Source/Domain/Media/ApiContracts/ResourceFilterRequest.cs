namespace VttTools.Media.ApiContracts;

public sealed record ResourceFilterRequest
    : Request {
    public ResourceType? ResourceType { get; init; }
    public string? ContentKind { get; init; }
    public string? Category { get; init; }
    public string? SearchText { get; init; }
    public bool? IsPublic { get; init; }
    public bool? IsPublished { get; init; }
    public int? Skip { get; init; }
    public int? Take { get; init; }
}