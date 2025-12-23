namespace VttTools.Media.ServiceContracts;

public sealed record ResourceFilterData
    : Data {
    public ResourceRole? Role { get; init; }
    public string? SearchText { get; init; }
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
        if (SearchText is { Length: > 256 })
            result += new Error("SearchText cannot exceed 256 characters.", nameof(SearchText));
        return result;
    }
}