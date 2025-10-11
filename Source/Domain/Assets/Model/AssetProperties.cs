namespace VttTools.Assets.Model;

/// <summary>
/// Base properties shared by all asset types
/// </summary>
public abstract record AssetProperties {
    /// <summary>
    /// Size of the asset in grid cells with optional named category
    /// Supports fractional sizes (⅛, ¼, ½) and whole numbers
    /// </summary>
    public NamedSize Size { get; init; } = NamedSize.Default;
}