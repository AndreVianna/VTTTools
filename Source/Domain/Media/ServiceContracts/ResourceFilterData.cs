namespace VttTools.Media.ServiceContracts;

public sealed record ResourceFilterData
    : Data {
    public ResourceType? ResourceType { get; init; }
    public string? ContentKind { get; init; }
    public string? Category { get; init; }
    public string? SearchText { get; init; }
    public Guid? OwnerId { get; init; }
    public bool? IsPublic { get; init; }
    public bool? IsPublished { get; init; }
    public int Skip { get; init; }
    public int Take { get; init; } = 50;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Skip < 0)
            result += new Error("Skip must be non-negative.", nameof(Skip));
        if (Take < 1)
            result += new Error("Take must be at least 1.", nameof(Take));
        if (Take > 100)
            result += new Error("Take cannot exceed 100.", nameof(Take));
        if (ContentKind is { Length: > 64 })
            result += new Error("ContentKind cannot exceed 64 characters.", nameof(ContentKind));
        if (Category is { Length: > 64 })
            result += new Error("Category cannot exceed 64 characters.", nameof(Category));
        if (SearchText is { Length: > 256 })
            result += new Error("SearchText cannot exceed 256 characters.", nameof(SearchText));
        return result;
    }
}
