namespace VttTools.Model.Game;

public class PlayerTypeTests {
    [Fact]
    public void PlayerType_HasExpectedValues()
        // Assert
        => Enum.GetValues<PlayerType>().Should().Contain([
            PlayerType.Guest,
            PlayerType.Player,
            PlayerType.Assistant,
            PlayerType.Master,
        ]);
}