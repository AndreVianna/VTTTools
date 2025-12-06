namespace VttTools.Domain.Admin.ApiContracts.Library;

public sealed record LibraryContentResponse : Response {
    public required Guid Id { get; init; }
    public required Guid OwnerId { get; init; }
    public string? OwnerName { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public required bool IsPublished { get; init; }
    public required bool IsPublic { get; init; }
    public required DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}