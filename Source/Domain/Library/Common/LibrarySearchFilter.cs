namespace VttTools.Library.Common;

public record LibrarySearchFilter {
    public string? Search { get; init; }
    public Guid? OwnerId { get; init; }
    public string? OwnerType { get; init; }
    public bool? IsPublished { get; init; }
    public bool? IsPublic { get; init; }
    public string? SortBy { get; init; }
    public string? SortOrder { get; init; }
    public int Skip { get; init; }
    public int Take { get; init; } = 20;
}
