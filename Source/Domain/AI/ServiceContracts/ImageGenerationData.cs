namespace VttTools.AI.ServiceContracts;

public sealed record ImageGenerationData
    : Data {
    public required GeneratedContentType ContentType { get; init; }
    public string? Provider { get; init; }
    public string? Model { get; init; }
    public required string Prompt { get; init; }
    public string? NegativePrompt { get; init; }
    public string AspectRatio { get; init; } = "1:1";
    public int? Width { get; init; }
    public int? Height { get; init; }
    public string? Style { get; init; }
}
