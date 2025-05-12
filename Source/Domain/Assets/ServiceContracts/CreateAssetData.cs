namespace VttTools.Assets.ServiceContracts;

/// <summary>
/// Data to create a new Asset template.
/// </summary>
public record CreateAssetData
    : Data {
    /// <summary>
    /// The name for the new Asset. If not set, name is unchanged.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The visibility setting for the new Asset. If not set, visibility is unchanged.
    /// </summary>
    public Visibility Visibility { get; set; }

    /// <summary>
    /// Type of the asset (e.g., Character, Object).
    /// </summary>
    [Required]
    public AssetType Type { get; init; }

    /// <summary>
    /// Source URL for the asset media.
    /// </summary>
    [Url]
    [Required]
    public string Source { get; init; } = string.Empty;
}