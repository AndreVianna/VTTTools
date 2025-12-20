namespace VttTools.Assets.ApiContracts;

public sealed record AddTokenRequest
    : Request {
    [Required]
    public required Guid ResourceId { get; init; }
}
