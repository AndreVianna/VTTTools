namespace VttTools.AI.ApiContracts;

public sealed record VideoGenerationRequest
    : Request {
    public required GeneratedContentType ContentType { get; init; }
    public string? Provider { get; init; }
    public string? Model { get; init; }
    public required string Prompt { get; init; }
    public TimeSpan? Duration { get; init; }
    public string AspectRatio { get; init; } = "16:9";
    public byte[]? ReferenceImage { get; init; }
}