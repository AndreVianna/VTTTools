namespace VttTools.AI.ApiContracts;

public sealed record VideoGenerationResponse
    : Response {
    public required byte[] VideoData { get; init; }
    public required string ContentType { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public TimeSpan Duration { get; init; }
    public decimal Cost { get; init; }
}
