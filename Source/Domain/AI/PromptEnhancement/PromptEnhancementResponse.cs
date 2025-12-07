namespace VttTools.AI.PromptEnhancement;

public sealed record PromptEnhancementResponse {
    public required string EnhancedPrompt { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public int TokensUsed { get; init; }
    public decimal Cost { get; init; }
    public TimeSpan Duration { get; init; }
}
