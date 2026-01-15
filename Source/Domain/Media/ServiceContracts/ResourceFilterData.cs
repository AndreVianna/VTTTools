namespace VttTools.Media.ServiceContracts;

public sealed record ResourceFilterData
    : Data {
    public ResourceRole? Role { get; init; }
    public string? SearchText { get; init; }
    public string[]? MediaTypes { get; init; }
    public int? MinWidth { get; init; }
    public int? MaxWidth { get; init; }
    public int? MinDurationMs { get; init; }
    public int? MaxDurationMs { get; init; }
    public Guid? OwnerId { get; init; }
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
        if (MinWidth is < 0)
            result += new Error("MinWidth must be non-negative.", nameof(MinWidth));
        if (MaxWidth is < 0)
            result += new Error("MaxWidth must be non-negative.", nameof(MaxWidth));
        if (MinWidth is not null && MaxWidth is not null && MinWidth > MaxWidth)
            result += new Error("MinWidth cannot exceed MaxWidth.", nameof(MinWidth));
        if (MinDurationMs is < 0)
            result += new Error("MinDurationMs must be non-negative.", nameof(MinDurationMs));
        if (MaxDurationMs is < 0)
            result += new Error("MaxDurationMs must be non-negative.", nameof(MaxDurationMs));
        if (MinDurationMs is not null && MaxDurationMs is not null && MinDurationMs > MaxDurationMs)
            result += new Error("MinDurationMs cannot exceed MaxDurationMs.", nameof(MinDurationMs));
        return result;
    }
}