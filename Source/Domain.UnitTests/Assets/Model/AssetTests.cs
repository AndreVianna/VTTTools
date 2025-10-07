using Size = VttTools.Common.Model.Size;
using VttTools.Media.Model;

namespace VttTools.Assets.Model;

public class AssetTests {
    [Fact]
    public void ObjectAsset_Constructor_InitializesWithDefaultValues() {
        // Arrange & Act
        var asset = new ObjectAsset();

        // Assert
        asset.Id.Should().NotBeEmpty();
        asset.OwnerId.Should().BeEmpty();
        asset.Name.Should().BeEmpty();
        asset.Kind.Should().Be(AssetKind.Object);
        asset.Description.Should().BeEmpty();
        asset.Resource.Should().BeNull();
        asset.Properties.Should().NotBeNull();
        asset.Properties.CellWidth.Should().Be(1);
        asset.Properties.IsMovable.Should().BeTrue();
    }

    [Fact]
    public void CreatureAsset_Constructor_InitializesWithDefaultValues() {
        // Arrange & Act
        var asset = new CreatureAsset();

        // Assert
        asset.Id.Should().NotBeEmpty();
        asset.Kind.Should().Be(AssetKind.Creature);
        asset.Properties.Should().NotBeNull();
        asset.Properties.CellSize.Should().Be(1);
        asset.Properties.Category.Should().Be(CreatureCategory.Character);
    }

    [Fact]
    public void ObjectAsset_WithValues_InitializesCorrectly() {
        // Arrange
        var id = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        const string name = "Wooden Table";
        const string description = "A sturdy oak table";
        var size = new Size(100, 200);
        var resource = new Resource {
            Id = Guid.NewGuid(),
            Type = ResourceType.Image,
            Path = "assets/table.png",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                ImageSize = size,
            },
            Tags = ["furniture", "indoor"],
        };

        // Act
        var asset = new ObjectAsset {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            Description = description,
            Resource = resource,
            Properties = new ObjectProperties {
                CellWidth = 2,
                CellHeight = 1,
                IsMovable = true,
                IsOpaque = false,
                IsVisible = true
            }
        };

        // Assert
        asset.Id.Should().Be(id);
        asset.OwnerId.Should().Be(ownerId);
        asset.Name.Should().Be(name);
        asset.Kind.Should().Be(AssetKind.Object);
        asset.Description.Should().Be(description);
        asset.Resource.Should().BeEquivalentTo(resource);
        asset.Properties.CellWidth.Should().Be(2);
        asset.Properties.CellHeight.Should().Be(1);
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
            Properties = new CreatureProperties {
                CellSize = 1,
                Category = CreatureCategory.Monster,
                TokenStyle = tokenStyle
            }
        };

        // Assert
        asset.Kind.Should().Be(AssetKind.Creature);
        asset.Properties.Category.Should().Be(CreatureCategory.Monster);
        asset.Properties.TokenStyle.Should().NotBeNull();
        asset.Properties.TokenStyle!.Shape.Should().Be(TokenShape.Circle);
    }
}
