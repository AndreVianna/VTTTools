namespace VttTools.AI.ApiContracts;

public sealed record TextGenerationRequest
    : Request {
    public required string Prompt { get; init; }
    public string? SystemPrompt { get; init; }
    public PromptCategory? Category { get; init; }
    public string? TemplateName { get; init; }
    public Dictionary<string, string>? TemplateContext { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public int? MaxTokens { get; init; }
    public double? Temperature { get; init; }
}
