namespace VttTools.AI.ServiceContracts;

public sealed record CreatePromptTemplateData : Data {
    public required string Name { get; init; }
    public required GeneratedContentType Category { get; init; }
    public string? Version { get; init; }
    public string SystemPrompt { get; init; } = string.Empty;
    public required string UserPromptTemplate { get; init; }
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
