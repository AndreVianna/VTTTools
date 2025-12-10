namespace VttTools.AI.ApiContracts;

public sealed record TextGenerationResponse
    : Response {
    public required string GeneratedText { get; init; }
    public PromptCategory? Category { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public int InputTokens { get; init; }
    public int OutputTokens { get; init; }
    public int TotalTokens { get; init; }
    public decimal Cost { get; init; }
    public TimeSpan Duration { get; init; }
}
