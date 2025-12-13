namespace VttTools.AI.ServiceContracts;

public sealed record AudioGenerationData
    : Data {
    public required string Provider { get; init; }
    public required string Model { get; init; }
    public required string Prompt { get; init; }
    public TimeSpan? Duration { get; init; }
    public bool Loop { get; init; }
}
