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
    /// Role(s) this resource plays (Token or Display)
    /// </summary>
    public ResourceRole Role { get; init; }
}
