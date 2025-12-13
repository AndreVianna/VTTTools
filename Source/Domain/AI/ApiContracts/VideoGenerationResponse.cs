namespace VttTools.AI.ApiContracts;

public sealed record VideoGenerationResponse
    : Response {
    public required byte[] VideoData { get; init; }
    public required string ContentType { get; init; }
    public int InputTokens { get; init; }
    public int OutputTokens { get; init; }
    public decimal Cost { get; init; }
    public TimeSpan Elapsed { get; init; }
}
