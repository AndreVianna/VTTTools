namespace VttTools.Contracts.Game;

public class UpdateEpisodeAssetDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateEpisodeAssetData {
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

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new UpdateEpisodeAssetData {
            Position = new Position { Left = 10, Top = 20 },
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithInvalidData_ReturnsSuccess() {
        // Arrange
        var data = new UpdateEpisodeAssetData {
            Position = null!,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle().Which.Message.Should().Be("The episode asset position cannot be null.");
    }

    [Fact]
    public void Validate_OptionalValuesNotSet_ReturnsSuccess() {
        // Arrange
        var data = new UpdateEpisodeAssetData();

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}