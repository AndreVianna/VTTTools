namespace VttTools.AI.ApiContracts;

public sealed record PromptEnhancementRequest
    : Request {
    public required string Provider { get; init; }
    public required string Model { get; init; }
    public required string Prompt { get; init; }
    public GeneratedContentType ContentType { get; init; }
    public string? Context { get; init; }
    public string? Style { get; init; }
}
