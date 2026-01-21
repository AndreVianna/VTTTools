namespace VttTools.AI.ApiContracts;

public sealed record AiJobRetryRequest : Request {
    public required Guid JobId { get; init; }
    public Guid[]? ItemIds { get; init; }
}