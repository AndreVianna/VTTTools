namespace VttTools.Library.Encounters.ServiceContracts;

public class AddAssetDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new EncounterAssetAddData {
            Name = "Asset Name",
            Position = new Position(1, 1),
            Size = new NamedSize { Width = 50, Height = 50 },
            Frame = new(),
            Rotation = 0,
            Elevation = 0,
        };
        const string name = "Other Name";
        var position = new Position(10, 20);
        var size = new NamedSize { Width = 10, Height = 20 };
        var frame = new Frame {
            Shape = FrameShape.Circle,
            BorderThickness = 2,
            BorderColor = "red",
            Background = "blue",
        };
        const float rotation = 45.0f;
        const float elevation = 10.0f;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Position = position,
            Size = size,
            Frame = frame,
            Rotation = rotation,
            Elevation = elevation,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Position.Should().Be(position);
        data.Size.Should().Be(size);
        data.Frame.Should().Be(frame);
        data.Rotation.Should().Be(rotation);
        data.Elevation.Should().Be(elevation);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new EncounterAssetAddData {
            Name = "Asset Name",
            Position = new Position(1, 1),
            Size = new NamedSize { Width = 50, Height = 50 },
            Frame = new(),
            Rotation = 0.0f,
            Elevation = 0.0f,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithInvalidData_ReturnsFailure() {
        // Arrange
        var data = new EncounterAssetAddData {
            Name = null!,
            Size = new NamedSize { Width = 1000, Height = 1000 },
            Frame = new(),
            Rotation = -270,
            Elevation = 2000,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
    }
}