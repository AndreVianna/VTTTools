namespace VttTools.AI.ApiContracts;

public sealed record PromptTemplateSearchResponse
    : Response {
    public required IReadOnlyList<PromptTemplateResponse> Items { get; init; }
    public required int TotalCount { get; init; }
    public required bool HasMore { get; init; }
}
