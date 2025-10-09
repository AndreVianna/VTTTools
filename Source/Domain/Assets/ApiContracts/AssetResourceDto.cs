namespace VttTools.Assets.ApiContracts;

/// <summary>
/// DTO representing a resource association with an asset
/// </summary>
public record AssetResourceDto {
    /// <summary>
    /// ID of the resource (image/video)
    /// </summary>
    public Guid ResourceId { get; init; }

    /// <summary>
    /// Role(s) this resource plays (Token, Portrait, or both)
    /// </summary>
    public ResourceRole Role { get; init; }

    /// <summary>
    /// Whether this is the default resource for its role(s)
    /// </summary>
    public bool IsDefault { get; init; }
}
