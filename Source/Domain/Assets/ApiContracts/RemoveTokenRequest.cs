namespace VttTools.Assets.ApiContracts;

public sealed record RemoveTokenRequest
    : Request {
    [Required]
    public required Guid ResourceId { get; init; }
}
