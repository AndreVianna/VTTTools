namespace VttTools.AI.ApiContracts;

public sealed record ImageGenerationRequest
    : Request {
    public required string Provider { get; init; }
    public required string Model { get; init; }
    public GeneratedContentType ContentType { get; init; }
    public required string Prompt { get; init; }
    public string? NegativePrompt { get; init; }
    public string AspectRatio { get; init; } = "1:1";
    public int? Width { get; init; }
    public int? Height { get; init; }
    public string? Style { get; init; }
}
