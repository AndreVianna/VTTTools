namespace VttTools.Game.Sessions.ServiceContracts;

public class CreateGameSessionDataTests {
    [Fact]
    public void WithClause_WithChangedValues_CreatesProperties() {
        // Arrange
        var original = new CreateGameSessionData {
            Title = "Title",
            SceneId = Guid.CreateVersion7(),
        };
        const string name = "Other Title";
        var sceneId = Guid.CreateVersion7();

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

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new CreateGameSessionData {
            Title = "New GameSession",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithInvalidData_ReturnsSuccess() {
        // Arrange
        var data = new CreateGameSessionData {
            Title = string.Empty,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("Game session title cannot be null or empty.");
    }
}