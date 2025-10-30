using VttTools.Media.Model;

using Size = VttTools.Common.Model.Size;

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
        asset.Resources.Should().NotBeNull().And.BeEmpty();
        asset.Properties.Should().NotBeNull();
        asset.Properties.Size.Width.Should().Be(1);
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
        asset.Properties.Size.Width.Should().Be(1);
        asset.Properties.Size.Height.Should().Be(1);
        asset.Properties.Size.IsSquare.Should().BeTrue();
        asset.Properties.Category.Should().Be(CreatureCategory.Character);
    }

    [Fact]
    public void ObjectAsset_WithValues_InitializesCorrectly() {
        // Arrange
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        const string name = "Wooden Table";
        const string description = "A sturdy oak table";
        var size = new Size(100, 200);
        var tokenId = Guid.CreateVersion7();
        var portraitId = Guid.CreateVersion7();
        var token = new Resource {
            Id = tokenId,
            Type = ResourceType.Image,
            Path = "assets/table-token.png",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                ImageSize = size,
            },
            Tags = ["furniture", "indoor"],
        };
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

        // Act
        var asset = new ObjectAsset {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            Description = description,
            Resources = [
                new AssetResource {
                    ResourceId = tokenId,
                    Resource = token,
                    Role = ResourceRole.Token
                },
                new AssetResource {
                    ResourceId = portraitId,
                    Resource = portrait,
                    Role = ResourceRole.Display
                }
            ],
            Properties = new ObjectProperties {
                Size = new NamedSize { Width = 2, Height = 1, IsSquare = false },
                IsMovable = true,
                IsOpaque = false
            }
        };

        // Assert
        asset.Id.Should().Be(id);
        asset.OwnerId.Should().Be(ownerId);
        asset.Name.Should().Be(name);
        asset.Kind.Should().Be(AssetKind.Object);
        asset.Description.Should().Be(description);
        asset.Resources.Should().NotBeEmpty();
        asset.Resources.First().ResourceId.Should().Be(tokenId);
        asset.Resources.First().Resource.Should().BeEquivalentTo(token);
        asset.Resources.First().Role.Should().HaveFlag(ResourceRole.Token);
        asset.Resources.Last().ResourceId.Should().Be(portraitId);
        asset.Resources.Last().Resource.Should().BeEquivalentTo(portrait);
        asset.Resources.Last().Role.Should().HaveFlag(ResourceRole.Display);
        asset.Properties.Size.Width.Should().Be(2);
        asset.Properties.Size.Height.Should().Be(1);
        asset.Properties.Size.IsSquare.Should().BeFalse();
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
                Size = new NamedSize { Width = 1, Height = 1, IsSquare = true },
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