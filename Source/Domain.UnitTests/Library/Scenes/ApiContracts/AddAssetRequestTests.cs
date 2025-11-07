namespace VttTools.Library.Scenes.ApiContracts;

public class AddAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new SceneAssetAddRequest {
            Name = "Asset Name",
            Position = new(1, 1),
            Size = new NamedSize { Width = 50, Height = 50 },
            Frame = new(),
            Rotation = 0,
            Elevation = 0,
        };
        const string name = "Other Name";
        var position = new Position(10, 20);
        var size = new NamedSize { Width = 100, Height = 200 };
        var frame = new Frame {
            Shape = FrameShape.Circle,
            BorderThickness = 2,
            BorderColor = "red",
            Background = "blue"
        };
        const float rotation = 45;
        const float elevation = 10;

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
        data.Frame.Should().BeEquivalentTo(frame);
        data.Rotation.Should().Be(rotation);
        data.Elevation.Should().Be(elevation);
    }
}