namespace VttTools.AI.ApiContracts;

public sealed record VideoGenerationRequest
    : Request {
    public required string Provider { get; init; }
    public required string Model { get; init; }
    public GeneratedContentType ContentType { get; init; }
    public required string Prompt { get; init; }
    public TimeSpan? Duration { get; init; }
    public string AspectRatio { get; init; } = "16:9";
    public byte[]? ReferenceImage { get; init; }
}
