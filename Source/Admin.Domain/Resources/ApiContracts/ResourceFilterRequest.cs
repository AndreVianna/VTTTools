namespace VttTools.Admin.Resources.ApiContracts;

public sealed record ResourceFilterRequest : Request {
    [Range(0, int.MaxValue, ErrorMessage = "Skip must be 0 or greater")]
    public int? Skip { get; init; } = 0;

    [Range(1, 100, ErrorMessage = "Take must be between 1 and 100")]
    public int? Take { get; init; } = 50;

    [MaxLength(200, ErrorMessage = "Search term cannot exceed 200 characters")]
    public string? SearchText { get; init; }

    [MaxLength(50, ErrorMessage = "ResourceType cannot exceed 50 characters")]
    public string? ResourceType { get; init; }

    [MaxLength(50, ErrorMessage = "ContentKind cannot exceed 50 characters")]
    public string? ContentKind { get; init; }

    [MaxLength(100, ErrorMessage = "Category cannot exceed 100 characters")]
    public string? Category { get; init; }

    public bool? IsPublished { get; init; }

    public bool? IsPublic { get; init; }
}
