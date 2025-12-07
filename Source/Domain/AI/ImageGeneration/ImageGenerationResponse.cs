namespace VttTools.AI.ImageGeneration;

public sealed record ImageGenerationResponse {
    public required byte[] ImageData { get; init; }
    public required string ContentType { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public int TokensUsed { get; init; }
    public decimal Cost { get; init; }
    public TimeSpan Duration { get; init; }
}
