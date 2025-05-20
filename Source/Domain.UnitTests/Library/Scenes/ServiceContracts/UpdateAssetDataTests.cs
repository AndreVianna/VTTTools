namespace VttTools.Library.Scenes.ServiceContracts;

public class UpdateAssetDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetData {
            Name = "Original",
            Position = new Vector2 { X = 1, Y = 1 },
            Scale = new Vector2 { X = 1f, Y = 1f },
            Rotation = 0.0f,
            Elevation = 0.0f,
            IsLocked = false,
            ControlledBy = Guid.Empty,
        };
        const string name = "New Name";
        var position = new Vector2 { X = 10, Y = 20 };
        var scale = new Vector2 { X = .5f, Y = .5f };
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
        data.Position.Should().Be(Optional<Vector2>.Some(position));
        data.Scale.Should().Be(Optional<Vector2>.Some(scale));
        data.Rotation.Should().Be(Optional<float>.Some(rotation));
        data.Elevation.Should().Be(Optional<float>.Some(elevation));
        data.IsLocked.Should().Be(Optional<bool>.Some(isLocked));
        data.ControlledBy.Should().Be(Optional<Guid?>.Some(controlledBy));
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new UpdateAssetData {
            Name = "Original",
            Position = new Vector2 { X = 1, Y = 1 },
            Scale = new Vector2 { X = 1f, Y = 1f },
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
            Scale = new Vector2 { X = 1000f, Y = 1000f },
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