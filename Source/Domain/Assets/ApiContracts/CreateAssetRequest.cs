namespace VttTools.Assets.ApiContracts;

/// <summary>
/// Request to create a new Asset template.
/// </summary>
public record CreateAssetRequest
    : Request {
    /// <summary>
    /// Type of the asset (e.g., Character, Object).
    /// </summary>
    public AssetType Type { get; init; }

    /// <summary>
    /// The name for the new Asset.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The description for the new Asset.
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// The display configuration for the new Asset.
    /// </summary>
    public Display Display { get; init; } = new();
}