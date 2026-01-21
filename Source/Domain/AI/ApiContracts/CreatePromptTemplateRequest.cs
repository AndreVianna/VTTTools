namespace VttTools.AI.ApiContracts;

public sealed record CreatePromptTemplateRequest
    : Request {
    public required string Name { get; init; }
    public required GeneratedContentType Category { get; init; }
    public string? Version { get; init; }
    public string SystemPrompt { get; init; } = string.Empty;
    public required string UserPromptTemplate { get; init; }
    public string? NegativePromptTemplate { get; init; }
    public Guid? ReferenceImageId { get; init; }
}