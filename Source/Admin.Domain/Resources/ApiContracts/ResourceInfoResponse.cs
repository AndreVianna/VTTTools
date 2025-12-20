namespace VttTools.Admin.Resources.ApiContracts;

public sealed record ResourceInfoResponse : Response {
    public required Guid Id { get; init; }
    public required string ResourceType { get; init; }
    public required ResourceClassification Classification { get; init; }
    public string? Description { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public required ulong FileLength { get; init; }
    public required Guid OwnerId { get; init; }
    public required bool IsPublished { get; init; }
    public required bool IsPublic { get; init; }
}
