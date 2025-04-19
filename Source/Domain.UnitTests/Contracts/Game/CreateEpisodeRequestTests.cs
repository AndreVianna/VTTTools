namespace VttTools.Contracts.Game;

public class CreateEpisodeRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateEpisodeRequest {
            Name = "Name",
            Visibility = Visibility.Private,
        };
        const string name = "Other Name";
        const Visibility visibility = Visibility.Public;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Visibility = visibility,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Visibility.Should().Be(visibility);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new CreateEpisodeRequest {
            Name = "Test Episode",
            Visibility = Visibility.Private,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithEmptyName_ReturnsSuccess() {
        // Arrange
        var request = new CreateEpisodeRequest {
            Name = string.Empty,
            Visibility = Visibility.Hidden,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message == "Episode name cannot be empty." && e.Sources.Contains(nameof(request.Name)));
    }
}