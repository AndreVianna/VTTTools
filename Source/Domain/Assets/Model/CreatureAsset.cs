namespace VttTools.Assets.Model;

/// <summary>
/// Asset representing controllable creatures (characters, NPCs, monsters)
/// </summary>
public record CreatureAsset : Asset {
    /// <summary>
    /// Creature-specific properties
    /// </summary>
    public CreatureProperties Properties { get; init; } = new();

    /// <summary>
    /// Constructor that automatically sets the Kind discriminator
    /// </summary>
    public CreatureAsset() {
        Kind = AssetKind.Creature;
    }
}