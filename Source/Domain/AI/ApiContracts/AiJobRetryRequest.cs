namespace VttTools.AI.ApiContracts;

public sealed record AiJobRetryRequest : Request {
    [Required]
    public required Guid JobId { get; init; }

    public Guid[]? ItemIds { get; init; }
}
