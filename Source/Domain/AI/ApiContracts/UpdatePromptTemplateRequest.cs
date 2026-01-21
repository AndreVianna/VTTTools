namespace VttTools.AI.ApiContracts;

public sealed record UpdatePromptTemplateRequest
    : Request {
    public Optional<string> Version { get; init; }
    public Optional<string> SystemPrompt { get; init; }
    public Optional<string> UserPromptTemplate { get; init; }
    public Optional<string?> NegativePromptTemplate { get; init; }
    public Optional<Guid?> ReferenceImageId { get; init; }
}