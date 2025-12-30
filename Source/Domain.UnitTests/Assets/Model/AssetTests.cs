using Size = VttTools.Common.Model.Size;

namespace VttTools.Assets.Model;

public class AssetTests {
    [Fact]
    public void Asset_Constructor_InitializesWithDefaultValues() {
        var asset = new Asset();

        asset.Id.Should().NotBeEmpty();
        asset.OwnerId.Should().BeEmpty();
        asset.Name.Should().BeEmpty();
        asset.Description.Should().BeEmpty();
        asset.Portrait.Should().BeNull();
        asset.Tokens.Should().BeEmpty();
        asset.Size.Width.Should().Be(1);
        asset.Size.Height.Should().Be(1);
        asset.IsPublished.Should().BeFalse();
        asset.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void Asset_WithValues_InitializesCorrectly() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        const string name = "Wooden Table";
        const string description = "A sturdy oak table";
        var size = new Size(100, 200);
        var portraitId = Guid.CreateVersion7();
        var portrait = new ResourceMetadata {
            Id = portraitId,
            Path = "assets/table-portrait.png",
            ContentType = "image/png",
            Dimensions = size,
        };

        var tokenId = Guid.CreateVersion7();
        var token = new ResourceMetadata {
            Id = tokenId,
            Path = "assets/table-token.png",
            ContentType = "image/png",
            Dimensions = size,
        };

        var classification = new AssetClassification(
            AssetKind.Object,
            "Furniture",
            "Container",
            "Chest");

        var asset = new Asset {
            Id = id,
            OwnerId = ownerId,
            Classification = classification,
            Name = name,
            Description = description,
            Portrait = portrait,
            Tokens = [token],
            Size = new NamedSize { Width = 2, Height = 1 },
            IsPublished = true,
            IsPublic = false
        };

        asset.Id.Should().Be(id);
        asset.OwnerId.Should().Be(ownerId);
        asset.Classification.Should().Be(classification);
        asset.Classification.Kind.Should().Be(AssetKind.Object);
        asset.Classification.Category.Should().Be("Furniture");
        asset.Classification.Type.Should().Be("Container");
        asset.Classification.Subtype.Should().Be("Chest");
        asset.Name.Should().Be(name);
        asset.Description.Should().Be(description);
        asset.Portrait.Should().BeEquivalentTo(portrait);
        asset.Tokens.Should().HaveCount(1);
        asset.Tokens[0].Should().BeEquivalentTo(token);
        asset.Size.Width.Should().Be(2);
        asset.Size.Height.Should().Be(1);
        asset.IsPublished.Should().BeTrue();
        asset.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void AssetClassification_InitializesCorrectly() {
        var classification = new AssetClassification(
            AssetKind.Creature,
            "Humanoid",
            "Goblinoid",
            "Goblin");

        classification.Kind.Should().Be(AssetKind.Creature);
        classification.Category.Should().Be("Humanoid");
        classification.Type.Should().Be("Goblinoid");
        classification.Subtype.Should().Be("Goblin");
    }

    [Fact]
    public void AssetClassification_WithNullSubtype_InitializesCorrectly() {
        var classification = new AssetClassification(
            AssetKind.Character,
            "Player",
            "Warrior",
            null);

        classification.Kind.Should().Be(AssetKind.Character);
        classification.Category.Should().Be("Player");
        classification.Type.Should().Be("Warrior");
        classification.Subtype.Should().BeNull();
    }
}