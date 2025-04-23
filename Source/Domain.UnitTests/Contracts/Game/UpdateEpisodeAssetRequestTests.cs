namespace VttTools.Contracts.Game;

public class UpdateEpisodeAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateEpisodeAssetRequest {
            Position = new Position { Left = 10, Top = 20 },
        };
        var position = new Position { Left = 5, Top = 30 };

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Position = position,
        };

        // Assert
        data.Position.Should().Be(Optional<Position>.Some(position));
    }
}