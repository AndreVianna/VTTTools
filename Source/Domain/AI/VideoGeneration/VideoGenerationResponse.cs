namespace VttTools.AI.VideoGeneration;

public sealed record VideoGenerationResponse {
    public required byte[] VideoData { get; init; }
    public required string ContentType { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public TimeSpan Duration { get; init; }
    public decimal Cost { get; init; }
}
