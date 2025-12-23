namespace VttTools.Assets.ApiContracts;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_ObjectAsset_UpdatesProperties() {
        var originalPortraitId = Guid.CreateVersion7();
        var original = new UpdateAssetRequest {
            Kind = AssetKind.Object,
            Category = "Furniture",
            Type = "Container",
            Name = "Table",
            Description = "A table",
            PortraitId = originalPortraitId,
            TokenSize = new NamedSize { Width = 1, Height = 1 },
            Tags = new ListPatcher<string>(["furniture"])
        };
        const string newName = "Large Table";
        var newPortraitId = Guid.CreateVersion7();

        var updated = original with {
            Name = newName,
            Category = "Furniture",
            Type = "Table",
            Subtype = "Dining",
            PortraitId = newPortraitId,
            TokenSize = new NamedSize { Width = 2, Height = 2 },
            Tags = new ListPatcher<string>(["furniture", "indoor"])
        };

        updated.Name.Value.Should().Be(newName);
        updated.Kind.Value.Should().Be(AssetKind.Object);
        updated.Category.Value.Should().Be("Furniture");
        updated.Type.Value.Should().Be("Table");
        updated.Subtype.Value.Should().Be("Dining");
        updated.PortraitId.Value.Should().Be(newPortraitId);
        updated.TokenSize.Value.Width.Should().Be(2);
        updated.TokenSize.Value.Height.Should().Be(2);
        updated.Tags.Value.Items.Should().HaveCount(2);
    }

    [Fact]
    public void WithClause_CreatureAsset_UpdatesProperties() {
        var original = new UpdateAssetRequest {
            Kind = AssetKind.Creature,
            Category = "Humanoid",
            Type = "Goblinoid",
            Name = "Goblin",
            TokenSize = new NamedSize { Width = 1, Height = 1 }
        };

        var updated = original with {
            Name = "Goblin Warrior",
            Subtype = "Goblin",
            TokenSize = new NamedSize { Width = 1, Height = 1 },
            Tags = new ListPatcher<string>(["hostile", "small"], [])
        };

        updated.Kind.Value.Should().Be(AssetKind.Creature);
        updated.Category.Value.Should().Be("Humanoid");
        updated.Type.Value.Should().Be("Goblinoid");
        updated.Subtype.Value.Should().Be("Goblin");
        updated.Name.Value.Should().Be("Goblin Warrior");
        updated.Tags.Value.Add.Should().HaveCount(2);
    }

    [Fact]
    public void Optional_Values_SetCorrectly() {
        var request = new UpdateAssetRequest {
            Name = "Test Name",
            IsPublished = true,
            IsPublic = false
        };

        request.Name.IsSet.Should().BeTrue();
        request.Name.Value.Should().Be("Test Name");
        request.IsPublished.IsSet.Should().BeTrue();
        request.IsPublished.Value.Should().BeTrue();
        request.IsPublic.IsSet.Should().BeTrue();
        request.IsPublic.Value.Should().BeFalse();
    }

    [Fact]
    public void Optional_UnsetValues_AreNotSet() {
        var request = new UpdateAssetRequest();

        request.Name.IsSet.Should().BeFalse();
        request.Description.IsSet.Should().BeFalse();
        request.Kind.IsSet.Should().BeFalse();
        request.Category.IsSet.Should().BeFalse();
        request.Type.IsSet.Should().BeFalse();
        request.Subtype.IsSet.Should().BeFalse();
        request.PortraitId.IsSet.Should().BeFalse();
        request.TokenSize.IsSet.Should().BeFalse();
        request.Tags.IsSet.Should().BeFalse();
        request.IsPublished.IsSet.Should().BeFalse();
        request.IsPublic.IsSet.Should().BeFalse();
    }

    [Fact]
    public void PortraitId_CanBeSetToNull() {
        var request = new UpdateAssetRequest {
            PortraitId = null
        };

        request.PortraitId.IsSet.Should().BeTrue();
        request.PortraitId.Value.Should().BeNull();
    }
}