namespace VttTools.Contracts.Game;

/// <inheritdoc />
public record UpdateAssetRequest
    : UpdateTemplateRequest<Asset> {
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
            result += new Error("Asset source cannot be null or empty.", nameof(Source));
        return result;
    }
}