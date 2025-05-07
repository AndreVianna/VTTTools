namespace VttTools.Library.Scenes.ApiContracts;

public class UpdateSceneRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateSceneRequest {
            Name = "Title",
            Visibility = Visibility.Private,
        };
        const string name = "Other Title";
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
        var request = new UpdateSceneRequest {
            Name = "Updated Scene",
            Visibility = Visibility.Public,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}