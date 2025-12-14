namespace VttTools.AI.ServiceContracts;

public sealed record AudioGenerationData
    : Data {
    public required GeneratedContentType ContentType { get; init; }
    public string? Provider { get; init; }
    public string? Model { get; init; }
    public required string Prompt { get; init; }
    public TimeSpan? Duration { get; init; }
    public bool Loop { get; init; }
}
