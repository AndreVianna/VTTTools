namespace VttTools.Library.Encounters.ServiceContracts;

public class UpdateAssetDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new EncounterAssetUpdateData {
            Name = "Original",
            Position = new Position(1, 1),
            Size = new NamedSize { Width = 50, Height = 50 },
            Frame = new(),
            Rotation = 0.0f,
            Elevation = 0.0f,
            IsLocked = false,
            ControlledBy = Guid.Empty,
        };
        const string name = "New Name";
        var position = new Position(10, 20);
        var size = new NamedSize { Width = 1000, Height = 2000 };
        var frame = new Frame {
            Shape = FrameShape.Circle,
            BorderThickness = 2,
            BorderColor = "red",
            Background = "blue"
        };
        const float rotation = 45.0f;
        const float elevation = 10.0f;
        const bool isLocked = true;
        var controlledBy = Guid.CreateVersion7();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Position = position,
            Size = size,
            Frame = frame,
            Rotation = rotation,
            Elevation = elevation,
            IsLocked = isLocked,
            ControlledBy = controlledBy,
        };

        // Assert
        data.Name.Value.Should().Be(name);
        data.Position.Value.Should().BeEquivalentTo(position);
        data.Size.Value.Should().Be(size);
        data.Frame.Value.Should().BeEquivalentTo(frame);
        data.Rotation.Value.Should().Be(rotation);
        data.Elevation.Value.Should().Be(elevation);
        data.IsLocked.Value.Should().Be(isLocked);
        data.ControlledBy.Value.Should().Be(controlledBy);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new EncounterAssetUpdateData {
            Name = "Original",
            Position = new Position(1, 1),
            Size = new NamedSize { Width = 10, Height = 20 },
            Frame = new Frame {
                Shape = FrameShape.Square,
                BorderThickness = 1,
                BorderColor = "white",
                Background = string.Empty
            },
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
        var data = new EncounterAssetUpdateData {
            Name = null!,
            Position = new Position(10, 20),
            Size = new NamedSize { Width = 1000, Height = 2000 },
            Frame = new Frame {
                Shape = FrameShape.Circle,
                BorderThickness = 2,
                BorderColor = "red",
                Background = "blue"
            },
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
        var data = new EncounterAssetUpdateData();

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}