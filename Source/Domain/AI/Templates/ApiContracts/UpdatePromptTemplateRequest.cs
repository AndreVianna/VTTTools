namespace VttTools.AI.Templates.ApiContracts;

public sealed record UpdatePromptTemplateRequest {
    [MaxLength(16)]
    public string? Version { get; init; }

    [MaxLength(4096)]
    public string? SystemPrompt { get; init; }

    [MaxLength(4096)]
    public string? UserPromptTemplate { get; init; }

    [MaxLength(2048)]
    public string? NegativePromptTemplate { get; init; }

    public Guid? ReferenceImageId { get; init; }
}
