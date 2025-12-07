namespace VttTools.AI.PromptEnhancement;

public sealed record PromptEnhancementRequest {
    public required string Prompt { get; init; }
    public string? Context { get; init; }
    public string? Style { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
}
