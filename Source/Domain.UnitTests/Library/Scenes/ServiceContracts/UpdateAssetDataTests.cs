namespace VttTools.Library.Scenes.ServiceContracts;

public class UpdateAssetDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetData {
            Name = "Original",
            Position = new Point { X = 1, Y = 1 },
            Scale = 1f,
            Rotation = 0.0f,
            Elevation = 0.0f,
            IsLocked = false,
            ControlledBy = Guid.Empty,
        };
        const string name = "New Name";
        var position = new Point { X = 10, Y = 20 };
        const float scale = .5f;
        const float rotation = 45.0f;
        const float elevation = 10.0f;
        const bool isLocked = true;
        var controlledBy = Guid.NewGuid();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Position = position,
            Scale = scale,
            Rotation = rotation,
            Elevation = elevation,
            IsLocked = isLocked,
            ControlledBy = controlledBy,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Position.Value.Should().BeEquivalentTo(position);
        data.Scale.Value.Should().Be(scale);
        data.Rotation.Value.Should().Be(rotation);
        data.Elevation.Value.Should().Be(elevation);
        data.IsLocked.Value.Should().Be(isLocked);
        data.ControlledBy.Value.Should().Be(controlledBy);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new UpdateAssetData {
            Name = "Original",
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
        var data = new UpdateAssetData {
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

    [Fact]
    public void Validate_OptionalValuesNotSet_ReturnsSuccess() {
        // Arrange
        var data = new UpdateAssetData();

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}