namespace VttTools.AI.ServiceContracts;

public sealed record TextGenerationData : Data {
    public required GeneratedContentType ContentType { get; init; }

    [MaxLength(64)]
    public string? Provider { get; init; }

    [MaxLength(64)]
    public string? Model { get; init; }

    [Required]
    [MaxLength(8192)]
    public required string Prompt { get; init; }

    [MaxLength(4096)]
    public string? SystemPrompt { get; init; }

    [MaxLength(128)]
    public string? TemplateName { get; init; }

    public Dictionary<string, string>? TemplateContext { get; init; }

    [Range(1, 16384)]
    public int? MaxTokens { get; init; }

    [Range(0.0, 2.0)]
    public double? Temperature { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (string.IsNullOrWhiteSpace(Prompt))
            result += new Error("The prompt cannot be null or empty.", nameof(Prompt));
        if (Prompt.Length > 8192)
            result += new Error("The prompt cannot have more than 8192 characters.", nameof(Prompt));
        if (SystemPrompt?.Length > 4096)
            result += new Error("The system prompt cannot have more than 4096 characters.", nameof(SystemPrompt));
        if (TemplateName?.Length > 128)
            result += new Error("The template name cannot have more than 128 characters.", nameof(TemplateName));
        if (Provider?.Length > 64)
            result += new Error("The provider name cannot have more than 64 characters.", nameof(Provider));
        if (Model?.Length > 64)
            result += new Error("The model name cannot have more than 64 characters.", nameof(Model));
        if (MaxTokens is < 1 or > 16384)
            result += new Error("MaxTokens must be between 1 and 16384.", nameof(MaxTokens));
        if (Temperature is < 0.0 or > 2.0)
            result += new Error("Temperature must be between 0.0 and 2.0.", nameof(Temperature));

        return result;
    }
}
