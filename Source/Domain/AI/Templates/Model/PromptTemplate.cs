namespace VttTools.AI.Templates.Model;

public sealed record PromptTemplate {
    public Guid Id { get; init; } = Guid.CreateVersion7();

    [Required]
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;

    public PromptCategory Category { get; init; }

    [Required]
    [MaxLength(16)]
    public string Version { get; init; } = "1.0";

    [MaxLength(4096)]
    public string SystemPrompt { get; init; } = string.Empty;

    [Required]
    [MaxLength(4096)]
    public string UserPromptTemplate { get; init; } = string.Empty;

    [MaxLength(2048)]
    public string? NegativePromptTemplate { get; init; }

    public Guid? ReferenceImageId { get; init; }
}
