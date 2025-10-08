namespace VttTools.Assets.Model;

/// <summary>
/// Asset representing environmental objects (furniture, traps, containers)
/// </summary>
public record ObjectAsset : Asset {
    /// <summary>
    /// Object-specific properties
    /// </summary>
    public ObjectProperties Properties { get; init; } = new();

    /// <summary>
    /// Constructor that automatically sets the Kind discriminator
    /// </summary>
    public ObjectAsset() {
        Kind = AssetKind.Object;
    }
}