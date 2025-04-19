namespace VttTools.Contracts.Game;

/// <summary>
/// Request to update an existing Asset template.
/// </summary>
public record UpdateAssetRequest : Request
{
    /// <summary>
    /// New name for the asset. If null or empty, name is unchanged.
    /// </summary>
    public string? Name { get; init; }

    /// <summary>
    /// New type for the asset. If null, type is unchanged.
    /// </summary>
    public AssetType? Type { get; init; }

    /// <summary>
    /// New source URL. If null or empty, source is unchanged.
    /// </summary>
    public string? Source { get; init; }

    /// <summary>
    /// New visibility setting. If null, visibility is unchanged.
    /// </summary>
    public Visibility? Visibility { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name is not null && (Name.Length == 0 || Name.All(char.IsWhiteSpace)))
            result += new Error("Asset name cannot be empty.", nameof(Name));
        if (Source is not null && (Source.Length == 0 || Source.All(char.IsWhiteSpace)))
            result += new Error("Asset source cannot be empty.", nameof(Source));
        return result;
    }
}