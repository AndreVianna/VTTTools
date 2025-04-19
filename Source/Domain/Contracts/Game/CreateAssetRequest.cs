namespace VttTools.Contracts.Game;

/// <summary>
/// Request to create a new Asset template.
/// </summary>
public record CreateAssetRequest : Request {
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
    [Url]
    [Required]
    public string Source { get; init; } = string.Empty;

    /// <summary>
    /// Visibility setting for the asset.
    /// </summary>
    public Visibility Visibility { get; init; } = Visibility.Hidden;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Asset name cannot be empty.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Source))
            result += new Error("Asset source cannot be empty.", nameof(Source));
        return result;
    }
}