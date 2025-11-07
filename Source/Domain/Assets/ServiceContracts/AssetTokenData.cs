namespace VttTools.Assets.ServiceContracts;

/// <summary>
/// DTO representing a resource association with an asset
/// </summary>
public record AssetTokenData {
    /// <summary>
    /// ID of the resource (image/video)
    /// </summary>
    public Guid TokenId { get; init; }

    /// <summary>
    /// IsDefault(s) this resource is the deafult token
    /// </summary>
    public bool IsDefault { get; init; }
}