namespace VttTools.Contracts.Game;

public class ChangeEpisodeAssetDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new ChangeEpisodeAssetData(new() { Left = 10, Top = 20 });
        var position = new Position { Left = 5, Top = 30 };

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            NewPosition = position,
        };

        // Assert
        data.NewPosition.Should().Be(position);
    }
}