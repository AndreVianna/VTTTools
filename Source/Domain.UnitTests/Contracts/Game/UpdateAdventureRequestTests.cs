namespace VttTools.Contracts.Game;

public class UpdateAdventureRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAdventureRequest {
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
        var request = new UpdateAdventureRequest {
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}