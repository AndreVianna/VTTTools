namespace VttTools.AI.ApiContracts;

public sealed record TextGenerationResponse
    : Response {
    public required string Provider { get; init; }
    public required string Model { get; init; }
    public required string GeneratedText { get; init; }
    public GeneratedContentType ContentType { get; init; }
    public int InputTokens { get; init; }
    public int OutputTokens { get; init; }
    public decimal Cost { get; init; }
    public TimeSpan Elapsed { get; init; }
}