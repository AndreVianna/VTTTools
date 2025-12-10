namespace VttTools.AI.ApiContracts;

public sealed record AudioGenerationResponse
    : Response {
    public required byte[] AudioData { get; init; }
    public required string ContentType { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public TimeSpan Duration { get; init; }
    public decimal Cost { get; init; }
}
