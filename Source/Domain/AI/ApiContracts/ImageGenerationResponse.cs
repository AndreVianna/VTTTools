namespace VttTools.AI.ApiContracts;

public sealed record ImageGenerationResponse
    : Response {
    public required byte[] ImageData { get; init; }
    public required string ContentType { get; init; }
    public int InputTokens { get; init; }
    public int OutputTokens { get; init; }
    public decimal Cost { get; init; }
    public TimeSpan Elapsed { get; init; }
}