namespace VttTools.Game.Sessions.ApiContracts;

public class JoinGameSessionRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new JoinGameSessionRequest {
            JoinAs = PlayerType.Assistant,
        };
        const PlayerType type = PlayerType.Master;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            JoinAs = type,
        };

        // Assert
        data.JoinAs.Should().Be(type);
    }
}