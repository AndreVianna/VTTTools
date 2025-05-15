namespace VttTools.Model.Game;

public class AssetTypeTests {
    [Fact]
    public void AssetType_HasExpectedValues()
        // Assert
        => Enum.GetValues<AssetType>().Should().Contain([
            AssetType.Placeholder,
            AssetType.Object,
            AssetType.Character,
            AssetType.NPC,
            AssetType.Creature,
            AssetType.Overlay,
            AssetType.Effect,
            AssetType.Elevation,
            AssetType.Wall,
        ]);
}