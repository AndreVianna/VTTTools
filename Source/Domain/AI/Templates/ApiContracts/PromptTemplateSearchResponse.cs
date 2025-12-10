namespace VttTools.AI.Templates.ApiContracts;

public sealed record PromptTemplateSearchResponse {
    public required IReadOnlyList<PromptTemplateResponse> Items { get; init; }
    public required int TotalCount { get; init; }
    public required bool HasMore { get; init; }
}
