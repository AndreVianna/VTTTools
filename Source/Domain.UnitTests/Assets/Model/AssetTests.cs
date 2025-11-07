
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
        asset.Tokens.Should().NotBeNull().And.BeEmpty();
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
        asset.Kind.Should().Be(AssetKind.Creature);
        asset.Size.Width.Should().Be(1);
        asset.Size.Height.Should().Be(1);
        asset.Category.Should().Be(CreatureCategory.Character);
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
        var otherToken = new Resource {
            Id = tokenId,
            Type = ResourceType.Image,
            Path = "assets/table-other-token.png",
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
            Tokens = [
                new AssetToken {
                    Token = token,
                    IsDefault = true
                },
                new AssetToken {
                    Token = otherToken,
                    IsDefault = false
                }
            ],
            Portrait = portrait,
            Size = new NamedSize { Width = 2, Height = 1 },
            IsMovable = true,
            IsOpaque = false
        };

        // Assert
        asset.Id.Should().Be(id);
        asset.OwnerId.Should().Be(ownerId);
        asset.Name.Should().Be(name);
        asset.Kind.Should().Be(AssetKind.Object);
        asset.Description.Should().Be(description);
        asset.Tokens.Should().NotBeEmpty();
        asset.Tokens.First().Token.Should().BeEquivalentTo(token);
        asset.Tokens.First().IsDefault.Should().BeTrue();
        asset.Tokens.Last().Token.Should().BeEquivalentTo(otherToken);
        asset.Tokens.Last().IsDefault.Should().BeFalse();
        asset.Portrait.Should().BeEquivalentTo(portrait);
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
            Category = CreatureCategory.Monster,
            TokenStyle = tokenStyle
        };

        // Assert
        asset.Kind.Should().Be(AssetKind.Creature);
        asset.Category.Should().Be(CreatureCategory.Monster);
        asset.TokenStyle.Should().NotBeNull();
        asset.TokenStyle!.Shape.Should().Be(TokenShape.Circle);
    }
}