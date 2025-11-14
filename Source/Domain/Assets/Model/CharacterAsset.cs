namespace VttTools.Assets.Model;

/// <summary>
/// Asset representing player characters and important NPCs
/// </summary>
public record CharacterAsset : CreatureAsset {
    /// <summary>
    /// Constructor that automatically sets the Kind discriminator
    /// </summary>
    public CharacterAsset() {
        Kind = AssetKind.Character;
    }
}
