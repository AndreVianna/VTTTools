namespace VttTools.AI.ServiceContracts;

public sealed record PromptEnhancementData
    : Data {
    public required string Provider { get; init; }
    public required string Model { get; init; }
    public required string Prompt { get; init; }
    public string? Context { get; init; }
    public string? Style { get; init; }
}
