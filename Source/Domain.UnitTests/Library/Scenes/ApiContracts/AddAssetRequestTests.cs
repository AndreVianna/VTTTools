namespace VttTools.Library.Scenes.ApiContracts;

public class AddAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new AddAssetRequest {
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
}
