namespace VttTools.Assets.ApiContracts;

/// <inheritdoc />
public record CreateAssetRequest
    : CreateTemplateRequest<Asset> {
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