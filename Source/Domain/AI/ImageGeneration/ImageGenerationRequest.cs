namespace VttTools.AI.ImageGeneration;

public sealed record ImageGenerationRequest {
    public required string Prompt { get; init; }
    public string? NegativePrompt { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public string AspectRatio { get; init; } = "1:1";
    public int? Width { get; init; }
    public int? Height { get; init; }
    public string? Style { get; init; }
}
