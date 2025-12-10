namespace VttTools.AI.ServiceContracts;

public sealed record CreatePromptTemplateData : Data {
    [Required]
    [MaxLength(128)]
    public required string Name { get; init; }

    [Required]
    public required PromptCategory Category { get; init; }

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

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The template name cannot be null or empty.", nameof(Name));
        if (Name.Length > 128)
            result += new Error("The template name cannot have more than 128 characters.", nameof(Name));
        if (string.IsNullOrWhiteSpace(UserPromptTemplate))
            result += new Error("The user prompt template cannot be null or empty.", nameof(UserPromptTemplate));
        if (UserPromptTemplate.Length > 4096)
            result += new Error("The user prompt template cannot have more than 4096 characters.", nameof(UserPromptTemplate));
        if (SystemPrompt.Length > 4096)
            result += new Error("The system prompt cannot have more than 4096 characters.", nameof(SystemPrompt));
        if (NegativePromptTemplate?.Length > 2048)
            result += new Error("The negative prompt template cannot have more than 2048 characters.", nameof(NegativePromptTemplate));
        if (Version?.Length > 16)
            result += new Error("The version cannot have more than 16 characters.", nameof(Version));

        return result;
    }
}
