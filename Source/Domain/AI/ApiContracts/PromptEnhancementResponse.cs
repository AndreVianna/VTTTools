namespace VttTools.AI.ApiContracts;

public sealed record PromptEnhancementResponse
    : Response {
    public required string EnhancedPrompt { get; init; }
    public int InputTokens { get; init; }
    public int OutputTokens { get; init; }
    public decimal Cost { get; init; }
    public TimeSpan Elapsed { get; init; }
}
