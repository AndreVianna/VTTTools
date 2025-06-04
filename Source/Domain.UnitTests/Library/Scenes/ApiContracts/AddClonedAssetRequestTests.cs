namespace VttTools.Library.Scenes.ApiContracts;

public class AddClonedAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new AddClonedAssetRequest {
            Name = "Asset Name",
            Display = new Display {
                Type = ResourceType.Image,
                Id = "some_file.png",
                Size = new(100, 200),
            },
            Position = new Point { X = 1, Y = 1 },
            Scale = 1f,
            Rotation = 0.0f,
            Elevation = 0.0f,
        };
        const string name = "Other Name";
        var display = new Display {
            Type = ResourceType.Video,
            Id = "some_file.png",
            Size = new() { Width = 300, Height = 400 },
        };
        var position = new Point { X = 10, Y = 20 };
        const float scale = .5f;
        const float rotation = 45.0f;
        const float elevation = 10.0f;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Display = display,
            Position = position,
            Scale = scale,
            Rotation = rotation,
            Elevation = elevation,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Display.Should().BeEquivalentTo(display, options => options.ExcludingMissingMembers());
        data.Position.Should().BeEquivalentTo(position, options => options.ExcludingMissingMembers());
        data.Scale.Should().Be(scale);
        data.Rotation.Should().Be(rotation);
        data.Elevation.Should().Be(elevation);
    }
}