namespace VttTools.Library.Scenes.ServiceContracts;

public class AddSceneAssetDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new AddSceneAssetData {
            Name = "Asset Name",
            Position = new() { Left = 10, Top = 20 },
            Scale = 1.5,
        };
        const string name = "Other Name";
        var position = new Position { Left = 10, Top = 20 };
        const double scale = 0.5;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Position = position,
            Scale = scale,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Position.Should().Be(position);
        data.Scale.Should().Be(scale);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new AddSceneAssetData {
            Name = "Asset Name",
            Position = new() { Left = 10, Top = 20 },
            Scale = 1.5,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithInvalidData_ReturnsSuccess() {
        // Arrange
        var data = new AddSceneAssetData {
            Scale = 0,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Message == "The scene asset scale must be greater than zero.");
    }
}