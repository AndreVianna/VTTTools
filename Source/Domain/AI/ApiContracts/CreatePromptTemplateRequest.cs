namespace VttTools.AI.ApiContracts;

public sealed record CreatePromptTemplateRequest
    : Request {
    [Required]
    [MaxLength(128)]
    public required string Name { get; init; }

    [Required]
    public required GeneratedContentType Category { get; init; }

    [MaxLength(16)]
    public string? Version { get; init; }

    [MaxLength(4096)]
    public string SystemPrompt { get; init; } = string.Empty;

    [Required]
    [MaxLength(4096)]
    public required string UserPromptTemplate { get; init; }

    [MaxLength(2048)]
    public string? NegativePromptTemplate { get; init; }

    public Guid? ReferenceImageId { get; init; }
}
