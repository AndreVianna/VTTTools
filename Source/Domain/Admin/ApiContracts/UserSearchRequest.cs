namespace VttTools.Domain.Admin.ApiContracts;
public sealed record UserSearchRequest : Request {
    [Range(0, int.MaxValue, ErrorMessage = "Skip must be 0 or greater")]
    public int Skip { get; init; } = 0;

    [Range(1, 100, ErrorMessage = "Take must be between 1 and 100")]
    public int Take { get; init; } = 50;

    [MaxLength(100, ErrorMessage = "Search term cannot exceed 100 characters")]
    public string? Search { get; init; }

    [MaxLength(50, ErrorMessage = "IsDefault name cannot exceed 50 characters")]
    public string? Role { get; init; }

    [MaxLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
    [RegularExpression("^(active|locked|unconfirmed)$", ErrorMessage = "Status must be 'active', 'locked', or 'unconfirmed'")]
    public string? Status { get; init; }

    [MaxLength(50, ErrorMessage = "SortBy field cannot exceed 50 characters")]
    [RegularExpression("^(email|displayName)$", ErrorMessage = "SortBy must be one of: email, displayName")]
    public string? SortBy { get; init; }

    [RegularExpression("^(asc|desc)$", ErrorMessage = "SortOrder must be 'asc' or 'desc'")]
    public string? SortOrder { get; init; }
}
