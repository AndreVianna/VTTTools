namespace VttTools.Model.Game;

public class EnumTests {
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
            AssetType.Sound,
            AssetType.Video,
        ]);

    [Fact]
    public void Visibility_HasExpectedValues()
        // Assert
        => Enum.GetValues<Visibility>().Should().Contain([
            Visibility.Hidden,
            Visibility.Private,
            Visibility.Public,
        ]);

    [Fact]
    public void StageMapType_HasExpectedValues()
        // Assert
        => Enum.GetValues<StageMapType>().Should().Contain([
            StageMapType.None,
            StageMapType.Square,
            StageMapType.HexH,
            StageMapType.HexV,
            StageMapType.Isometric,
        ]);

    [Fact]
    public void PlayerType_HasExpectedValues()
        // Assert
        => Enum.GetValues<PlayerType>().Should().Contain([
            PlayerType.Guest,
            PlayerType.Player,
            PlayerType.Assistant,
            PlayerType.Master,
        ]);

    [Fact]
    public void ContentType_HasExpectedValues()
        // Assert
        => Enum.GetValues<ContentType>().Should().Contain([
            ContentType.Text,
            ContentType.Command,
        ]);

    [Fact]
    public void CellType_HasExpectedValues()
        // Assert
        => Enum.GetValues<CellType>().Should().Contain([
            CellType.Square,
            CellType.VerticalHex,
            CellType.HorizontalHex,
            CellType.Isometric,
        ]);
}