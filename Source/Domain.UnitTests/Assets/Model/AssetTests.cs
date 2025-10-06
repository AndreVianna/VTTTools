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
        asset.Resource.Should().BeNull();
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
        var format = new Resource {
            Id = Guid.NewGuid(),
            Type = ResourceType.Image,
            Path = "assets/test-asset-Resource",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                ImageSize = size,
            },
            Tags = ["tag1", "tag2"],
        };

        // Act
        var asset = new Asset {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            Type = type,
            Description = description,
            Resource = format,
        };

        // Assert
        asset.Id.Should().Be(id);
        asset.OwnerId.Should().Be(ownerId);
        asset.Name.Should().Be(name);
        asset.Type.Should().Be(type);
        asset.Description.Should().Be(description);
        asset.Resource.Should().BeEquivalentTo(format);
    }
}