namespace VttTools.Domain.Admin.ApiContracts.Library;

public sealed record LibrarySearchRequest : Request {
    [Range(0, int.MaxValue, ErrorMessage = "Skip must be 0 or greater")]
    public int? Skip { get; init; }

    [Range(1, 100, ErrorMessage = "Take must be between 1 and 100")]
    public int? Take { get; init; } = 20;

    [MaxLength(200, ErrorMessage = "Search term cannot exceed 200 characters")]
    public string? Search { get; init; }

    public Guid? OwnerId { get; init; }

    [MaxLength(20, ErrorMessage = "OwnerType cannot exceed 20 characters")]
    [RegularExpression("^(master|user|all)$", ErrorMessage = "OwnerType must be 'master', 'user', or 'all'")]
    public string? OwnerType { get; init; }

    public bool? IsPublished { get; init; }

    public bool? IsPublic { get; init; }

    [MaxLength(50, ErrorMessage = "SortBy field cannot exceed 50 characters")]
    public string? SortBy { get; init; }

    [MaxLength(4, ErrorMessage = "SortOrder cannot exceed 4 characters")]
    [RegularExpression("^(asc|desc)$", ErrorMessage = "SortOrder must be 'asc' or 'desc'")]
    public string? SortOrder { get; init; }
}
