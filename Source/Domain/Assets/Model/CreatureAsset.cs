namespace VttTools.Assets.Model;

/// <summary>
/// Asset representing controllable creatures (characters, NPCs, monsters)
/// </summary>
public record CreatureAsset : Asset {
    /// <summary>
    /// Constructor that automatically sets the Kind discriminator
    /// </summary>
    public CreatureAsset() {
        Kind = AssetKind.Monster;
    }

    /// <summary>
    /// Reference to the creature's stat block (to be implemented in future phase)
    /// </summary>
    public Guid? StatBlockId { get; init; }

    /// <summary>
    /// Optional visual styling for the creature's token
    /// </summary>
    public TokenStyle? TokenStyle { get; init; }
}