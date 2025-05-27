namespace VttTools.Library.Scenes.ServiceContracts;

public class AddAssetDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new AddAssetData {
            Name = "Asset Name",
            Position = new Point { X = 1, Y = 1 },
            Scale = 1f,
            Rotation = 0.0f,
            Elevation = 0.0f,
        };
        const string name = "Other Name";
        var position = new Point { X = 10, Y = 20 };
        const float scale = .5f;
        const float rotation = 45.0f;
        const float elevation = 10.0f;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Position = position,
            Scale = scale,
            Rotation = rotation,
            Elevation = elevation,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Position.Should().Be(position);
        data.Scale.Should().Be(scale);
        data.Rotation.Should().Be(rotation);
        data.Elevation.Should().Be(elevation);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new AddAssetData {
            Name = "Asset Name",
            Position = new Point { X = 1, Y = 1 },
            Scale = 1f,
            Rotation = 0.0f,
            Elevation = 0.0f,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithInvalidData_ReturnsSuccess() {
        // Arrange
        var data = new AddAssetData {
            Name = null!,
            Scale = 1000f,
            Rotation = -270,
            Elevation = 2000,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
    }
}
