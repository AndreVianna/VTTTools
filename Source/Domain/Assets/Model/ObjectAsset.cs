namespace VttTools.Assets.Model;

/// <summary>
/// Asset representing environmental objects (furniture, traps, containers)
/// </summary>
public record ObjectAsset : Asset {
    /// <summary>
    /// Constructor that automatically sets the Kind discriminator
    /// </summary>
    public ObjectAsset() {
        Kind = AssetKind.Object;
    }

    /// <summary>
    /// Whether the object can be moved after placement
    /// </summary>
    public bool IsMovable { get; init; } = true;

    /// <summary>
    /// Whether the object blocks line of sight and light
    /// </summary>
    public bool IsOpaque { get; init; }

    /// <summary>
    /// Optional reference to an Effect that triggers when interacted with (for traps)
    /// </summary>
    public Guid? TriggerEffectId { get; init; }
}