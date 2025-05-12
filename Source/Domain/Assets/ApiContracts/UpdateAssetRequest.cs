namespace VttTools.Assets.ApiContracts;

/// <summary>
/// Request to update an existing Asset template.
/// </summary>
public record UpdateAssetRequest
    : Request {
    /// <summary>
    /// New name for the Asset. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New visibility setting for the Asset. If not set, visibility is unchanged.
    /// </summary>
    public Optional<Visibility> Visibility { get; set; }

    /// <summary>
    /// New type for the asset. If not set, type is unchanged.
    /// </summary>
    public Optional<AssetType> Type { get; init; }

    /// <summary>
    /// New source for the asset. If not set, source is unchanged.
    /// </summary>
    public Optional<string> Source { get; init; }
}