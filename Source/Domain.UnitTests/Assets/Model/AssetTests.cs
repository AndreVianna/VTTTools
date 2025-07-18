using VttTools.Media.Model;

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
        asset.Display.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var id = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        const string name = "Test Asset";
        const AssetType type = AssetType.Character;
        const string description = "Test Description";
        var size = new Size(100, 200);
        var format = new Display {
            Id = Guid.NewGuid(),
            Type = ResourceType.Image,
            Path = "assets/test-asset-display",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                ImageSize = size,
            },
            Offset = new Point(10, 20),
            Tags = ["tag1", "tag2"],
            Rotation = 45.0f,
            Scale = new(1.5f, 0.5f),
        };

        // Act
        var asset = new Asset {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            Type = type,
            Description = description,
            Display = format,
        };

        // Assert
        asset.Id.Should().Be(id);
        asset.OwnerId.Should().Be(ownerId);
        asset.Name.Should().Be(name);
        asset.Type.Should().Be(type);
        asset.Description.Should().Be(description);
        asset.Display.Should().BeEquivalentTo(format);
    }
}