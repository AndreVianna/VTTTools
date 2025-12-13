namespace VttTools.AI.ApiContracts;

public sealed record TextGenerationRequest
    : Request {
    public required string Provider { get; init; }
    public required string Model { get; init; }
    public GeneratedContentType ContentType { get; init; }
    public string? SystemPrompt { get; init; }
    public required string Prompt { get; init; }
    public string? Template { get; init; }
    public Dictionary<string, string>? Context { get; init; }
    public int? MaxTokens { get; init; }
    public double? Temperature { get; init; }
}
