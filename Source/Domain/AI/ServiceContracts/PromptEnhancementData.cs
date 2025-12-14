namespace VttTools.AI.ServiceContracts;

public sealed record PromptEnhancementData
    : Data {
    public string? Provider { get; init; }
    public string? Model { get; init; }
    public required string Prompt { get; init; }
    public string? Context { get; init; }
    public string? Style { get; init; }
}
