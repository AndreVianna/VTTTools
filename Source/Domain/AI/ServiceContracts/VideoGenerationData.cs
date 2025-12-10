namespace VttTools.AI.ServiceContracts;

public sealed record VideoGenerationData
    : Data {
    public required string Prompt { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public TimeSpan? Duration { get; init; }
    public string AspectRatio { get; init; } = "16:9";
    public byte[]? ReferenceImage { get; init; }
}
