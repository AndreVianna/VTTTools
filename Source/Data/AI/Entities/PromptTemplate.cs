using Resource = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.AI.Entities;

public sealed record PromptTemplate {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public PromptCategory Category { get; set; }
    [MaxLength(16)]
    public string Version { get; set; } = "1.0";
    [MaxLength(4096)]
    public string SystemPrompt { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string UserPromptTemplate { get; set; } = string.Empty;
    [MaxLength(2048)]
    public string? NegativePromptTemplate { get; set; }
    public Guid? ReferenceImageId { get; set; }
    public Resource? ReferenceImage { get; set; }
}
