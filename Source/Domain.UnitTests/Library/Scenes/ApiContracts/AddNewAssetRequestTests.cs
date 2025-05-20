namespace VttTools.Library.Scenes.ApiContracts;

public class AddNewAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new AddNewAssetRequest {
            Name = "Asset Name",
            Position = new Vector2 { X = 1, Y = 1 },
            Scale = new Vector2 { X = 1f, Y = 1f },
            Rotation = 0.0f,
            Elevation = 0.0f,
        };
        const string name = "Other Name";
        var position = new Vector2 { X = 10, Y = 20 };
        var scale = new Vector2 { X = .5f, Y = .5f };
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
}