namespace VttTools.AI.Model;

public sealed record PromptTemplate {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public string Name { get; init; } = string.Empty;
    public PromptCategory Category { get; init; }
    public string Version { get; init; } = "1.0";
    public string SystemPrompt { get; init; } = string.Empty;
    public string UserPromptTemplate { get; init; } = string.Empty;
    public string? NegativePromptTemplate { get; init; }
    public ResourceMetadata? ReferenceImage { get; init; }
}
