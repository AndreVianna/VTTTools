namespace VttTools.Assets.ApiContracts;

public sealed record RemoveTokenRequest
    : Request {
    public required Guid ResourceId { get; init; }
}
