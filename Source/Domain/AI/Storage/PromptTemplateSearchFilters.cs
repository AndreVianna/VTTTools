namespace VttTools.AI.Storage;

public sealed record PromptTemplateSearchFilters {
    public string? Name { get; init; }
    public GeneratedContentType? Category { get; init; }
    public VersionScope Scope { get; init; } = VersionScope.LatestOnly;
    public Pagination? Pagination { get; init; }
}
