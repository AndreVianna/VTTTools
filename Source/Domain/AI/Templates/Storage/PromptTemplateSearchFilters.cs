namespace VttTools.AI.Templates.Storage;

public sealed record PromptTemplateSearchFilters {
    public string? Name { get; init; }
    public PromptCategory? Category { get; init; }
    public VersionScope Scope { get; init; } = VersionScope.LatestOnly;
    public Pagination? Pagination { get; init; }
}
