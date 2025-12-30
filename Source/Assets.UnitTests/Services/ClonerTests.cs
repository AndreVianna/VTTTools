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
            Classification = new(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
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
            Classification = new(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
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
            Path = "/path/to/portrait.jpg",
            ContentType = "image/jpeg",
            FileName = "portrait.jpg",
            FileSize = 1024,
            Dimensions = new(256, 256),
        };
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Asset with Portrait",
            Classification = new(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            Portrait = portrait,
            OwnerId = Guid.CreateVersion7()
        };

        var clone = original.Clone();

        clone.Portrait.Should().NotBeNull();
        clone.Portrait!.Id.Should().Be(portrait.Id);
        clone.Portrait.Path.Should().Be(portrait.Path);
        clone.Portrait.ContentType.Should().Be(portrait.ContentType);
        clone.Portrait.FileName.Should().Be(portrait.FileName);
        clone.Portrait.FileSize.Should().Be(portrait.FileSize);
        clone.Portrait.Dimensions.Should().Be(portrait.Dimensions);
    }

    [Fact]
    public void Clone_WithNullPortrait_ClonesWithoutPortrait() {
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Asset without Portrait",
            Classification = new(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
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
            Classification = new(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = Guid.CreateVersion7(),
            Tokens = [
                new() { Id = token1Id, Path = "/token1.png", ContentType = "image/png", FileName = "token1.png", FileSize = 1024 },
                new() { Id = token2Id, Path = "/token2.png", ContentType = "image/png", FileName = "token2.png", FileSize = 2048 },
            ],
        };

        var clone = original.Clone();

        clone.Tokens.Should().HaveCount(2);
        clone.Tokens[0].Id.Should().Be(token1Id);
        clone.Tokens[1].Id.Should().Be(token2Id);
    }

    [Fact]
    public void Clone_WithTokenSize_ClonesTokenSize() {
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Asset with Size",
            Classification = new(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = Guid.CreateVersion7(),
            Size = new(SizeName.Large)
        };

        var clone = original.Clone();

        clone.Size.Should().Be(original.Size);
    }

    [Fact]
    public void Clone_WithEmptyTags_ClonesEmptyTags() {
        var original = new Asset {
            Id = Guid.CreateVersion7(),
            Name = "Asset without Tags",
            Classification = new(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
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
            Path = "/path/to/resource.jpg",
            ContentType = "image/jpeg",
            FileName = "resource.jpg",
            FileSize = 2048,
            Dimensions = new(512, 512),
            Duration = TimeSpan.FromSeconds(10),
        };

        var clone = original.Clone();

        clone.Should().NotBeNull();
        clone.Id.Should().Be(originalId);
        clone.Path.Should().Be(original.Path);
        clone.ContentType.Should().Be(original.ContentType);
        clone.FileName.Should().Be(original.FileName);
        clone.FileSize.Should().Be(original.FileSize);
        clone.Dimensions.Should().Be(original.Dimensions);
        clone.Duration.Should().Be(original.Duration);
    }

    [Fact]
    public void Clone_ResourceMetadata_WithZeroDuration_ClonesWithZeroDuration() {
        var original = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            Path = "/path/to/resource.jpg",
            ContentType = "image/jpeg",
            FileName = "resource.jpg",
            FileSize = 1024,
            Duration = TimeSpan.Zero,
        };

        var clone = original.Clone();

        clone.Duration.Should().Be(TimeSpan.Zero);
    }

    [Fact]
    public void Clone_WithStatEntries_DeepClonesAllLevels() {
        var gameSystemId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var modifiers = new StatModifier[] {
            new() { Condition = "vs undead", Source = "Holy Weapon", Bonus = 2.0m },
            new() { Condition = "while raging", Source = "Barbarian Rage", Bonus = 3.0m },
        };
        var statEntry = new StatEntry {
            AssetId = assetId,
            GameSystemId = gameSystemId,
            GameSystemCode = "dnd5e",
            Level = 1,
            Key = "STR",
            Value = "16",
            Type = StatEntryType.Number,
            Description = "Strength score",
            Modifiers = modifiers,
        };
        var statEntries = new Dictionary<Guid, Dictionary<int, Map<StatEntry>>> {
            {
                gameSystemId,
                new Dictionary<int, Map<StatEntry>> {
                    { 1, new Map<StatEntry> { { "STR", statEntry } } }
                }
            }
        };
        var original = new Asset {
            Id = assetId,
            Name = "Asset with StatBlockEntries",
            Classification = new(AssetKind.Creature, "Humanoid", "Goblinoid", "Goblin"),
            OwnerId = Guid.CreateVersion7(),
            StatBlockEntries = statEntries,
        };

        var clone = original.Clone();

        clone.StatBlockEntries.Should().HaveCount(1);
        clone.StatBlockEntries.Should().ContainKey(gameSystemId);
        clone.StatBlockEntries[gameSystemId].Should().HaveCount(1);
        clone.StatBlockEntries[gameSystemId].Should().ContainKey(1);
        clone.StatBlockEntries[gameSystemId][1].Should().HaveCount(1);
        clone.StatBlockEntries[gameSystemId][1].Should().ContainKey("STR");

        var clonedEntry = clone.StatBlockEntries[gameSystemId][1]["STR"];
        clonedEntry.AssetId.Should().Be(assetId);
        clonedEntry.GameSystemId.Should().Be(gameSystemId);
        clonedEntry.GameSystemCode.Should().Be("dnd5e");
        clonedEntry.Level.Should().Be(1);
        clonedEntry.Key.Should().Be("STR");
        clonedEntry.Value.Should().Be("16");
        clonedEntry.Type.Should().Be(StatEntryType.Number);
        clonedEntry.Description.Should().Be("Strength score");

        clonedEntry.Modifiers.Should().NotBeNull();
        clonedEntry.Modifiers.Should().HaveCount(2);
        clonedEntry.Modifiers![0].Condition.Should().Be("vs undead");
        clonedEntry.Modifiers[0].Source.Should().Be("Holy Weapon");
        clonedEntry.Modifiers[0].Bonus.Should().Be(2.0m);
        clonedEntry.Modifiers[1].Condition.Should().Be("while raging");
        clonedEntry.Modifiers[1].Source.Should().Be("Barbarian Rage");
        clonedEntry.Modifiers[1].Bonus.Should().Be(3.0m);

        // Verify deep clone by checking modifiers are not the same reference
        clonedEntry.Modifiers.Should().NotBeSameAs(modifiers);
    }

    [Fact]
    public void Clone_StatEntry_WithModifiers_DeepClonesModifiers() {
        var modifiers = new StatModifier[] {
            new() { Condition = "test condition", Source = "test source", Bonus = 5.0m },
        };
        var original = new StatEntry {
            AssetId = Guid.CreateVersion7(),
            GameSystemId = Guid.CreateVersion7(),
            GameSystemCode = "test",
            Level = 1,
            Key = "TEST",
            Value = "10",
            Type = StatEntryType.Number,
            Description = "Test stat",
            Modifiers = modifiers,
        };

        var clone = original.Clone();

        clone.Modifiers.Should().NotBeNull();
        clone.Modifiers.Should().HaveCount(1);
        clone.Modifiers![0].Condition.Should().Be("test condition");
        clone.Modifiers[0].Source.Should().Be("test source");
        clone.Modifiers[0].Bonus.Should().Be(5.0m);
        clone.Modifiers.Should().NotBeSameAs(modifiers);
    }

    [Fact]
    public void Clone_StatEntry_WithNullModifiers_ClonesWithNullModifiers() {
        var original = new StatEntry {
            AssetId = Guid.CreateVersion7(),
            GameSystemId = Guid.CreateVersion7(),
            GameSystemCode = "test",
            Level = 1,
            Key = "TEST",
            Value = "10",
            Type = StatEntryType.Number,
            Modifiers = null,
        };

        var clone = original.Clone();

        clone.Modifiers.Should().BeNull();
    }

    [Fact]
    public void Clone_StatModifier_CopiesAllProperties() {
        var original = new StatModifier {
            Condition = "when flanking",
            Source = "Tactical Advantage",
            Bonus = 2.5m,
        };

        var clone = original.Clone();

        clone.Condition.Should().Be("when flanking");
        clone.Source.Should().Be("Tactical Advantage");
        clone.Bonus.Should().Be(2.5m);
    }
}
