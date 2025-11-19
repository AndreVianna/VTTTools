
using Size = VttTools.Common.Model.Size;

namespace VttTools.Assets.Model;

public class AssetTests {
    [Fact]
    public void ObjectAsset_Constructor_InitializesWithDefaultValues() {
        var asset = new ObjectAsset();

        asset.Id.Should().NotBeEmpty();
        asset.OwnerId.Should().BeEmpty();
        asset.Name.Should().BeEmpty();
        asset.Description.Should().BeEmpty();
        asset.Portrait.Should().BeNull();
        asset.TopDown.Should().BeNull();
        asset.Miniature.Should().BeNull();
        asset.Photo.Should().BeNull();
        asset.Size.Width.Should().Be(1);
        asset.Size.Height.Should().Be(1);
        asset.IsMovable.Should().BeTrue();
    }

    [Fact]
    public void CreatureAsset_Constructor_InitializesWithDefaultValues() {
        // Arrange & Act
        var asset = new CreatureAsset();

        // Assert
        asset.Id.Should().NotBeEmpty();
        asset.Size.Width.Should().Be(1);
        asset.Size.Height.Should().Be(1);
    }

    [Fact]
    public void ObjectAsset_WithValues_InitializesCorrectly() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        const string name = "Wooden Table";
        const string description = "A sturdy oak table";
        var size = new Size(100, 200);
        var portraitId = Guid.CreateVersion7();
        var topDownId = Guid.CreateVersion7();
        var portrait = new Resource {
            Id = portraitId,
            Type = ResourceType.Image,
            Path = "assets/table-portrait.png",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                ImageSize = size,
            },
            Tags = ["furniture", "indoor"],
        };
        var topDown = new Resource {
            Id = topDownId,
            Type = ResourceType.Image,
            Path = "assets/table-topdown.png",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                ImageSize = size,
            },
            Tags = ["furniture", "indoor"],
        };

        var asset = new ObjectAsset {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            Description = description,
            Portrait = portrait,
            TopDown = topDown,
            Size = new NamedSize { Width = 2, Height = 1 },
            IsMovable = true,
            IsOpaque = false
        };

        asset.Id.Should().Be(id);
        asset.OwnerId.Should().Be(ownerId);
        asset.Name.Should().Be(name);
        asset.Description.Should().Be(description);
        asset.Portrait.Should().BeEquivalentTo(portrait);
        asset.TopDown.Should().BeEquivalentTo(topDown);
        asset.Size.Width.Should().Be(2);
        asset.Size.Height.Should().Be(1);
    }

    [Fact]
    public void CreatureAsset_WithTokenStyle_InitializesCorrectly() {
        // Arrange
        var tokenStyle = new TokenStyle {
            BorderColor = "#FF0000",
            BackgroundColor = "#FFE0E0",
            Shape = TokenShape.Circle
        };

        // Act
        var asset = new CreatureAsset {
            Name = "Goblin Warrior",
            Description = "Small hostile creature",
            Size = new NamedSize { Width = 1, Height = 1 },
            TokenStyle = tokenStyle
        };

        // Assert
        asset.TokenStyle.Should().NotBeNull();
        asset.TokenStyle!.Shape.Should().Be(TokenShape.Circle);
    }
}