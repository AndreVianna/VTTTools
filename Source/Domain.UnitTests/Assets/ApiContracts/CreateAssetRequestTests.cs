namespace VttTools.Assets.ApiContracts;

public class CreateAssetRequestTests {
    [Fact]
    public void WithClause_ObjectAsset_UpdatesProperties() {
        var original = new CreateAssetRequest {
            Kind = AssetKind.Object,
            Category = "Furniture",
            Type = "Container",
            Subtype = "Chest",
            Name = "Table",
            Description = "A table",
            PortraitId = Guid.CreateVersion7(),
            TokenId = Guid.CreateVersion7(),
            TokenSize = new NamedSize { Width = 1, Height = 1 },
            Tags = ["furniture", "indoor"]
        };
        const string name = "Large Table";

        var updated = original with {
            Name = name,
            Category = "Furniture",
            Type = "Table",
            Subtype = "Dining",
            TokenSize = new NamedSize { Width = 2, Height = 1 },
            Tags = ["furniture", "indoor", "large"]
        };

        updated.Name.Should().Be(name);
        updated.Kind.Should().Be(AssetKind.Object);
        updated.Category.Should().Be("Furniture");
        updated.Type.Should().Be("Table");
        updated.Subtype.Should().Be("Dining");
        updated.TokenSize.Width.Should().Be(2);
        updated.TokenSize.Height.Should().Be(1);
        updated.Tags.Should().HaveCount(3);
        updated.Tags.Should().Contain("large");
    }

    [Fact]
    public void WithClause_CreatureAsset_UpdatesProperties() {
        var original = new CreateAssetRequest {
            Kind = AssetKind.Creature,
            Category = "Humanoid",
            Type = "Goblinoid",
            Subtype = "Goblin",
            Name = "Goblin",
            Description = "A goblin",
            TokenSize = new NamedSize { Width = 1, Height = 1 }
        };

        var updated = original with {
            Name = "Goblin Warrior",
            TokenSize = new NamedSize { Width = 1, Height = 1 },
            Tags = ["hostile", "small"]
        };

        updated.Kind.Should().Be(AssetKind.Creature);
        updated.Category.Should().Be("Humanoid");
        updated.Type.Should().Be("Goblinoid");
        updated.Subtype.Should().Be("Goblin");
        updated.Name.Should().Be("Goblin Warrior");
        updated.Tags.Should().HaveCount(2);
    }

    [Fact]
    public void CategoryAndType_AreRequired() {
        var request = new CreateAssetRequest {
            Kind = AssetKind.Character,
            Category = "Player",
            Type = "Fighter",
            Name = "Test Character"
        };

        request.Category.Should().Be("Player");
        request.Type.Should().Be("Fighter");
    }

    [Fact]
    public void Subtype_CanBeNull() {
        var request = new CreateAssetRequest {
            Kind = AssetKind.Character,
            Category = "Player",
            Type = "Fighter",
            Subtype = null,
            Name = "Test Character"
        };

        request.Subtype.Should().BeNull();
    }

    [Fact]
    public void CategoryTypeSubtype_TrimWhitespace() {
        var request = new CreateAssetRequest {
            Kind = AssetKind.Creature,
            Category = "  Humanoid  ",
            Type = "  Goblinoid  ",
            Subtype = "  Goblin  ",
            Name = "  Test  "
        };

        request.Category.Should().Be("Humanoid");
        request.Type.Should().Be("Goblinoid");
        request.Subtype.Should().Be("Goblin");
        request.Name.Should().Be("Test");
    }
}