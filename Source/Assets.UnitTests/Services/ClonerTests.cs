namespace VttTools.Assets.Services;

public class ClonerTests {
    [Fact]
    public void Clone_WithAsset_CreatesNewInstance() {
        var originalId = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var original = new Asset {
            Id = originalId,
            Name = "Original Asset",
            Description = "Original Description",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = ownerId,
            IsPublic = true,
            IsPublished = true,
            Tags = ["tag1", "tag2"]
        };

        var clone = original.Clone();

        clone.Should().NotBeNull();
        clone.Id.Should().NotBe(originalId);
        clone.Name.Should().Be(original.Name);
        clone.Description.Should().Be(original.Description);
        clone.Classification.Should().Be(original.Classification);
        clone.OwnerId.Should().Be(original.OwnerId);
        clone.IsPublic.Should().Be(original.IsPublic);
        clone.IsPublished.Should().Be(original.IsPublished);
        clone.Tags.Should().BeEquivalentTo(original.Tags);
    }

    [Fact]
    public void Clone_WithDifferentOwnerId_SetsNewOwnerId() {
        var originalOwnerId = Guid.CreateVersion7();
        var newOwnerId = Guid.CreateVersion7();
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Original Asset",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = originalOwnerId
        };

        var clone = original.Clone(newOwnerId);

        clone.OwnerId.Should().Be(newOwnerId);
        clone.OwnerId.Should().NotBe(originalOwnerId);
    }

    [Fact]
    public void Clone_WithPortrait_ClonesPortrait() {
        var portraitId = Guid.CreateVersion7();
        var portrait = new ResourceMetadata {
            Id = portraitId,
            Description = "Portrait Description",
            Path = "/path/to/portrait.jpg",
            ResourceType = ResourceType.Portrait,
            ContentType = "image/jpeg",
            FileName = "portrait.jpg",
            FileLength = 1024,
            Size = new Size(256, 256),
            OwnerId = Guid.CreateVersion7(),
            IsPublic = true,
            IsPublished = true,
            Features = new Map<HashSet<string>> { { "feature1", [] }, { "feature2", [] } }
        };
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Asset with Portrait",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            Portrait = portrait,
            OwnerId = Guid.CreateVersion7()
        };

        var clone = original.Clone();

        clone.Portrait.Should().NotBeNull();
        clone.Portrait!.Id.Should().Be(portrait.Id);
        clone.Portrait.Description.Should().Be(portrait.Description);
        clone.Portrait.Path.Should().Be(portrait.Path);
        clone.Portrait.ResourceType.Should().Be(portrait.ResourceType);
        clone.Portrait.ContentType.Should().Be(portrait.ContentType);
        clone.Portrait.FileName.Should().Be(portrait.FileName);
        clone.Portrait.FileLength.Should().Be(portrait.FileLength);
        clone.Portrait.Size.Should().Be(portrait.Size);
        clone.Portrait.OwnerId.Should().Be(portrait.OwnerId);
        clone.Portrait.IsPublic.Should().Be(portrait.IsPublic);
        clone.Portrait.IsPublished.Should().Be(portrait.IsPublished);
        clone.Portrait.Features.Should().BeEquivalentTo(portrait.Features);
    }

    [Fact]
    public void Clone_WithNullPortrait_ClonesWithoutPortrait() {
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Asset without Portrait",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            Portrait = null,
            OwnerId = Guid.CreateVersion7()
        };

        var clone = original.Clone();

        clone.Portrait.Should().BeNull();
    }

    [Fact]
    public void Clone_WithTokens_ClonesAllTokens() {
        var token1Id = Guid.CreateVersion7();
        var token2Id = Guid.CreateVersion7();
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Asset with Tokens",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = Guid.CreateVersion7(),
            Tokens = [
                new ResourceMetadata { Id = token1Id, Path = "/token1.png", ResourceType = ResourceType.Token, ContentType = "image/png", FileName = "token1.png", FileLength = 1024, OwnerId = Guid.CreateVersion7(), IsPublic = true, IsPublished = true },
                new ResourceMetadata { Id = token2Id, Path = "/token2.png", ResourceType = ResourceType.Token, ContentType = "image/png", FileName = "token2.png", FileLength = 2048, OwnerId = Guid.CreateVersion7(), IsPublic = false, IsPublished = false }
            ]
        };

        var clone = original.Clone();

        clone.Tokens.Should().HaveCount(2);
        clone.Tokens[0].Id.Should().Be(token1Id);
        clone.Tokens[1].Id.Should().Be(token2Id);
    }

    [Fact]
    public void Clone_WithStatBlocks_ClonesAllStatBlocks() {
        var statBlock1 = new Map<StatBlockValue> { { "Name", "DnD 5e Goblin" }, { "HP", 7 } };
        var statBlock2 = new Map<StatBlockValue> { { "Name", "Pathfinder Goblin" }, { "HP", 6 } };
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Asset with StatBlocks",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = Guid.CreateVersion7(),
            StatBlocks = new Dictionary<int, Map<StatBlockValue>> {
                { 0, statBlock1 },
                { 1, statBlock2 }
            }
        };

        var clone = original.Clone();

        clone.StatBlocks.Should().HaveCount(2);
        clone.StatBlocks.Should().ContainKey(0);
        clone.StatBlocks.Should().ContainKey(1);
        clone.StatBlocks[0].Should().BeEquivalentTo(statBlock1);
        clone.StatBlocks[1].Should().BeEquivalentTo(statBlock2);
    }

    [Fact]
    public void Clone_WithTokenSize_ClonesTokenSize() {
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Asset with TokenSize",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = Guid.CreateVersion7(),
            TokenSize = new NamedSize(SizeName.Large)
        };

        var clone = original.Clone();

        clone.TokenSize.Should().Be(original.TokenSize);
    }

    [Fact]
    public void Clone_WithEmptyTags_ClonesEmptyTags() {
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Asset without Tags",
            Classification = new AssetClassification(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = Guid.CreateVersion7(),
            Tags = []
        };

        var clone = original.Clone();

        clone.Tags.Should().BeEmpty();
    }

    [Fact]
    public void Clone_ResourceMetadata_CreatesNewInstance() {
        var originalId = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var original = new ResourceMetadata {
            Id = originalId,
            Description = "Resource Description",
            Path = "/path/to/resource.jpg",
            ResourceType = ResourceType.Illustration,
            ContentType = "image/jpeg",
            FileName = "resource.jpg",
            FileLength = 2048,
            Size = new Size(512, 512),
            Duration = TimeSpan.FromSeconds(10),
            Features = new Map<HashSet<string>> { { "feature1", [] }, { "feature2", [] } },
            OwnerId = ownerId,
            IsPublic = true,
            IsPublished = true
        };

        var clone = original.Clone();

        clone.Should().NotBeNull();
        clone.Id.Should().Be(originalId);
        clone.Description.Should().Be(original.Description);
        clone.Path.Should().Be(original.Path);
        clone.ResourceType.Should().Be(original.ResourceType);
        clone.ContentType.Should().Be(original.ContentType);
        clone.FileName.Should().Be(original.FileName);
        clone.FileLength.Should().Be(original.FileLength);
        clone.Size.Should().Be(original.Size);
        clone.Duration.Should().Be(original.Duration);
        clone.Features.Should().BeEquivalentTo(original.Features);
        clone.OwnerId.Should().Be(original.OwnerId);
        clone.IsPublic.Should().Be(original.IsPublic);
        clone.IsPublished.Should().Be(original.IsPublished);
    }

    [Fact]
    public void Clone_ResourceMetadata_WithZeroDuration_ClonesWithZeroDuration() {
        var original = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            Path = "/path/to/resource.jpg",
            ResourceType = ResourceType.Illustration,
            ContentType = "image/jpeg",
            FileName = "resource.jpg",
            FileLength = 1024,
            Duration = TimeSpan.Zero,
            OwnerId = Guid.CreateVersion7()
        };

        var clone = original.Clone();

        clone.Duration.Should().Be(TimeSpan.Zero);
    }

    [Fact]
    public void Clone_ResourceMetadata_WithEmptyFeatures_ClonesEmptyFeatures() {
        var original = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            Path = "/path/to/resource.jpg",
            ResourceType = ResourceType.Illustration,
            ContentType = "image/jpeg",
            FileName = "resource.jpg",
            FileLength = 1024,
            Features = [],
            OwnerId = Guid.CreateVersion7()
        };

        var clone = original.Clone();

        clone.Features.Should().BeEmpty();
    }
}
