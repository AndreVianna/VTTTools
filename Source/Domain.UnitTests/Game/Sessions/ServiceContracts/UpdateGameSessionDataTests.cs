namespace VttTools.Game.Sessions.ServiceContracts;

public class UpdateGameSessionDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateGameSessionData {
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

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new UpdateGameSessionData {
            Title = "Updated GameSession Title",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithInvalidData_ReturnsSuccess() {
        // Arrange
        var data = new UpdateGameSessionData {
            Title = string.Empty,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("Game session title cannot be null or empty.");
    }

    [Fact]
    public void Validate_OptionalValuesNotSet_ReturnsSuccess() {
        // Arrange
        var data = new UpdateGameSessionData();

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}