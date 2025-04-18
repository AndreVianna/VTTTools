namespace VttTools.Contracts.Game;

/// <summary>
/// Request to create a new Asset template.
/// </summary>
public record CreateAssetRequest : Request
{
    /// <summary>
    /// Name of the asset.
    /// </summary>
    [Required]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Type of the asset (e.g., Character, Object).
    /// </summary>
    [Required]
    public AssetType Type { get; init; }

    /// <summary>
    /// Source URL for the asset media.
    /// </summary>
    [Required]
    [Url]
    public string Source { get; init; } = string.Empty;

    /// <summary>
    /// Visibility setting for the asset.
    /// </summary>
    public Visibility Visibility { get; init; } = Visibility.Hidden;
}