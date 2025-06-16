namespace VttTools.Assets.ApiContracts;

public record CreateAssetRequest
    : Request {
    public AssetType Type { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? DisplayId { get; init; }
}