namespace VttTools.AI.ApiContracts;

public sealed record AudioGenerationRequest
    : Request {
    public required GeneratedContentType ContentType { get; init; }
    public string? Provider { get; init; }
    public string? Model { get; init; }
    public required string Prompt { get; init; }
    public TimeSpan? Duration { get; init; }
    public bool Loop { get; init; }
}
