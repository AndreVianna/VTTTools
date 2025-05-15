namespace VttTools.Assets.ApiContracts;

/// <summary>
/// Request to update an existing Asset template.
/// </summary>
public record UpdateAssetRequest
    : Request {
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<AssetType> Type { get; init; }
    public Optional<Format> Format { get; set; }
    public Optional<bool> IsListed { get; set; }
    public Optional<bool> IsPublic { get; set; }
}