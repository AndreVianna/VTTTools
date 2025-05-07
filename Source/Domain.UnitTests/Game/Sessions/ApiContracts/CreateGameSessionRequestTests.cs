namespace VttTools.Game.Sessions.ApiContracts;

public class CreateGameSessionRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateGameSessionRequest {
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
        data.Title.Should().Be(name);
        data.SceneId.Should().Be(sceneId);
    }
}