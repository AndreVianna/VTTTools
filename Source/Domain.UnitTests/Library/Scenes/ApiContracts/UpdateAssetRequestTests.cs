namespace VttTools.Library.Scenes.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateSceneAssetRequest {
            Name = "Original",
            Position = new Position(1, 1),
            Size = new NamedSize { Width = 50, Height = 50, IsSquare = false },
            Frame = new Frame(),
            Rotation = 0.0f,
            Elevation = 0.0f,
            IsLocked = false,
            ControlledBy = Guid.Empty,
        };
        const string name = "New Name";
        var position = new Position(10, 20);
        var size = new NamedSize { Width = 100, Height = 200, IsSquare = false };
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
}