namespace VttTools.Library.Scenes.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
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
}