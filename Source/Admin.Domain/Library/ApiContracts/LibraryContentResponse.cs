namespace VttTools.Admin.Library.ApiContracts;

public sealed record LibraryContentResponse : Response {
    public required Guid Id { get; init; }
    public required Guid OwnerId { get; init; }
    public string? OwnerName { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public required bool IsPublished { get; init; }
    public required bool IsPublic { get; init; }
}