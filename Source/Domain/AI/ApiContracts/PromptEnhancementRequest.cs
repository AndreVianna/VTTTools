namespace VttTools.AI.ApiContracts;

public sealed record PromptEnhancementRequest
    : Request {
    public required string Prompt { get; init; }
    public string? Provider { get; init; }
    public string? Model { get; init; }
    public string? Context { get; init; }
    public string? Style { get; init; }
}