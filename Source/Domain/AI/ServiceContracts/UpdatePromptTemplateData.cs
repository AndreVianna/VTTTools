namespace VttTools.AI.ServiceContracts;

public sealed record UpdatePromptTemplateData : Data {
    public Optional<string> Version { get; init; }
    public Optional<string> SystemPrompt { get; init; }
    public Optional<string> UserPromptTemplate { get; init; }
    public Optional<string?> NegativePromptTemplate { get; init; }
    public Optional<Guid?> ReferenceImageId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (Version is { IsSet: true, Value.Length: > 16 })
            result += new Error("The version cannot have more than 16 characters.", nameof(Version));
        if (SystemPrompt is { IsSet: true, Value.Length: > 4096 })
            result += new Error("The system prompt cannot have more than 4096 characters.", nameof(SystemPrompt));
        if (UserPromptTemplate.IsSet && string.IsNullOrWhiteSpace(UserPromptTemplate.Value))
            result += new Error("When set, the user prompt template cannot be null or empty.", nameof(UserPromptTemplate));
        if (UserPromptTemplate is { IsSet: true, Value.Length: > 4096 })
            result += new Error("The user prompt template cannot have more than 4096 characters.", nameof(UserPromptTemplate));
        if (NegativePromptTemplate is { IsSet: true, Value.Length: > 2048 })
            result += new Error("The negative prompt template cannot have more than 2048 characters.", nameof(NegativePromptTemplate));

        return result;
    }
}