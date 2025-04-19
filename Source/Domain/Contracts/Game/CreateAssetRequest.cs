namespace VttTools.Contracts.Game;

/// <summary>
/// Request to create a new Asset template.
/// </summary>
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

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Source))
            result += new Error("Asset source cannot be empty.", nameof(Source));
        return result;
    }
}