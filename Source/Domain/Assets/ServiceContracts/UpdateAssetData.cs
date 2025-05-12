namespace VttTools.Assets.ServiceContracts;

/// <summary>
/// Data to update an existing Asset template.
/// </summary>
public record UpdateAssetData
    : Data {
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

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Source.IsSet && string.IsNullOrWhiteSpace(Source.Value))
            result += new Error("When set, the asset source cannot be null or empty.", nameof(Source));
        return result;
    }
}