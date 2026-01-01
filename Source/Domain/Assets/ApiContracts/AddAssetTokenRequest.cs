namespace VttTools.Assets.ApiContracts;

public record AddAssetTokenRequest
    : Request {
    public string? Description { get; init; }
    public string[] Tags { get; init; } = [];
    public Guid TokenId { get; init; }
}