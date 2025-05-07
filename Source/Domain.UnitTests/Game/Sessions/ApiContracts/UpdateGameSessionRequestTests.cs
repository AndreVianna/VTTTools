namespace VttTools.Game.Sessions.ApiContracts;

public class UpdateGameSessionRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateGameSessionRequest {
            Title = "Title",
            SceneId = Guid.NewGuid(),
        };
        const string name = "Other Title";
        var sceneId = Guid.NewGuid();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Title = name,
            SceneId = sceneId,
        };

        // Assert
        data.Title.Value.Should().Be(name);
        data.SceneId.Value.Should().Be(sceneId);
    }
}