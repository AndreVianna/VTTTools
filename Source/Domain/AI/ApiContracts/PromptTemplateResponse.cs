namespace VttTools.AI.ApiContracts;

public sealed record PromptTemplateResponse
    : Response {
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required GeneratedContentType ContentType { get; init; }
    public required string Version { get; init; }
    public required string SystemPrompt { get; init; }
    public required string UserPromptTemplate { get; init; }
    public string? NegativePromptTemplate { get; init; }
    public Guid? ReferenceImageId { get; init; }
}
