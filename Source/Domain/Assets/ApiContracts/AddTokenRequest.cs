namespace VttTools.Assets.ApiContracts;

public sealed record AddTokenRequest
    : Request {
    public required Guid ResourceId { get; init; }
}