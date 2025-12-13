namespace VttTools.AI.ApiContracts;

public sealed record AudioGenerationRequest
    : Request {
    public required string Provider { get; init; }
    public required string Model { get; init; }
    public GeneratedContentType ContentType { get; init; }
    public required string Prompt { get; init; }
    public TimeSpan? Duration { get; init; }
    public bool Loop { get; init; }
}
