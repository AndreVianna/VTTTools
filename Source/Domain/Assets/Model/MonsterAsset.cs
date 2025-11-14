namespace VttTools.Assets.Model;

public record MonsterAsset : CreatureAsset {
    /// <summary>
    /// Constructor that automatically sets the Kind discriminator
    /// </summary>
    public MonsterAsset() {
        Kind = AssetKind.Monster;
    }
}
