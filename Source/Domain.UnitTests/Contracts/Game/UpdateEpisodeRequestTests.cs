namespace VttTools.Contracts.Game;

public class UpdateEpisodeRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateEpisodeRequest {
            Name = "Subject",
            Visibility = Visibility.Private,
        };
        const string name = "Other Subject";
        const Visibility visibility = Visibility.Public;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Visibility = visibility,
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Visibility.Value.Should().Be(visibility);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new UpdateEpisodeRequest {
            Name = "Updated Episode",
            Visibility = Visibility.Public,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}