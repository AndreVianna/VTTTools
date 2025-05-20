namespace VttTools.Assets.Model;

public class AssetTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var asset = new Asset();

        // Assert
        asset.Id.Should().NotBeEmpty();
        asset.OwnerId.Should().BeEmpty();
        asset.Name.Should().BeEmpty();
        asset.Type.Should().Be(AssetType.Placeholder);
        asset.Description.Should().BeEmpty();
        asset.Shape.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        const string name = "Test Asset";
        const AssetType type = AssetType.Character;
        const string description = "Test Description";
        var size = new Vector2 { X = 100, Y = 200 };
        var format = new Shape {
            Type = MediaType.Image,
            SourceId = Guid.NewGuid(),
            Size = size,
        };

        // Act
        var asset = new Asset {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            Type = type,
            Description = description,
            Shape = format,
        };

        // Assert
        asset.Id.Should().Be(id);
        asset.OwnerId.Should().Be(ownerId);
        asset.Name.Should().Be(name);
        asset.Type.Should().Be(type);
        asset.Description.Should().Be(description);
        asset.Shape.Should().BeEquivalentTo(format);
    }
}