namespace VttTools.Data.Assets;

public class AssetsMapperTests {
    [Fact]
    public void ToModel_WithValidEntity_ReturnsCorrectModel() {
        var ownerId = Guid.CreateVersion7();
        var portraitId = Guid.CreateVersion7();
        var tokenId = Guid.CreateVersion7();

        var portrait = new Media.Entities.Resource {
            Id = portraitId,
            ResourceType = ResourceType.Portrait,
            Path = "assets/portraits/dragon.png",
            ContentType = "image/png",
            FileName = "dragon.png",
            FileLength = 100000,
            Size = new(512, 512),
            Duration = TimeSpan.Zero,
            OwnerId = ownerId,
            IsPublished = true,
            IsPublic = false,
        };

        var token = new Media.Entities.Resource {
            Id = tokenId,
            ResourceType = ResourceType.Token,
            Path = "assets/tokens/dragon.png",
            ContentType = "image/png",
            FileName = "dragon_token.png",
            FileLength = 50000,
            Size = new(256, 256),
            Duration = TimeSpan.Zero,
            OwnerId = ownerId,
            IsPublished = true,
            IsPublic = false,
        };

        var entity = new Entities.Asset {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Kind = AssetKind.Creature,
            Category = "dragon",
            Type = "red_dragon",
            Subtype = "ancient",
            Name = "Ancient Red Dragon",
            Description = "A powerful ancient dragon",
            TokenSize = new(2, 2),
            StatBlock = [
                new Entities.AssetStatBlockValue {
                    AssetId = Guid.CreateVersion7(),
                    Level = 1,
                    Key = "HP",
                    Type = Entities.AssetStatBlockValueType.Number,
                    Value = "450",
                },
                new Entities.AssetStatBlockValue {
                    AssetId = Guid.CreateVersion7(),
                    Level = 1,
                    Key = "AC",
                    Type = Entities.AssetStatBlockValueType.Number,
                    Value = "22",
                },
                new Entities.AssetStatBlockValue {
                    AssetId = Guid.CreateVersion7(),
                    Level = 1,
                    Key = "Legendary",
                    Type = Entities.AssetStatBlockValueType.Flag,
                    Value = "True",
                },
            ],
            IsPublic = false,
            IsPublished = true,
            IsDeleted = false,
            Tags = ["boss", "flying"],
            PortraitId = portraitId,
            Portrait = portrait,
            AssetTokens = [
                new Entities.AssetToken {
                    AssetId = Guid.CreateVersion7(),
                    TokenId = tokenId,
                    Index = 0,
                    Token = token,
                },
            ],
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.OwnerId.Should().Be(ownerId);
        result.Classification.Should().NotBeNull();
        result.Classification.Kind.Should().Be(AssetKind.Creature);
        result.Classification.Category.Should().Be("dragon");
        result.Classification.Type.Should().Be("red_dragon");
        result.Classification.Subtype.Should().Be("ancient");
        result.Name.Should().Be("Ancient Red Dragon");
        result.Description.Should().Be("A powerful ancient dragon");
        result.TokenSize.Should().BeEquivalentTo(new NamedSize(2, 2));
        result.StatBlocks.Should().ContainKey(1);
        result.StatBlocks[1].Should().ContainKey("HP");
        result.StatBlocks[1]["HP"].Number.Should().Be(450);
        result.StatBlocks[1]["AC"].Number.Should().Be(22);
        result.StatBlocks[1]["Legendary"].Flag.Should().BeTrue();
        result.IsPublic.Should().BeFalse();
        result.IsPublished.Should().BeTrue();
        result.IsDeleted.Should().BeFalse();
        result.Tags.Should().BeEquivalentTo(["boss", "flying"]);
        result.Portrait.Should().NotBeNull();
        result.Portrait!.Id.Should().Be(portraitId);
        result.Tokens.Should().HaveCount(1);
        result.Tokens[0].Id.Should().Be(tokenId);
    }

    [Fact]
    public void ToModel_WithNullEntity_ReturnsNull() {
        Entities.Asset? entity = null;

        var result = entity.ToModel();

        result.Should().BeNull();
    }

    [Fact]
    public void ToModel_WithoutPortraitAndTokens_ReturnsModelWithNulls() {
        var entity = new Entities.Asset {
            Id = Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            Kind = AssetKind.Object,
            Category = "weapon",
            Type = "sword",
            Subtype = null,
            Name = "Simple Sword",
            Description = "A basic sword",
            TokenSize = new(1, 1),
            StatBlock = [],
            IsPublic = true,
            IsPublished = true,
            IsDeleted = false,
            Tags = [],
            PortraitId = null,
            Portrait = null,
            AssetTokens = [],
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Portrait.Should().BeNull();
        result.Tokens.Should().BeEmpty();
        result.StatBlocks.Should().BeEmpty();
        result.Tags.Should().BeEmpty();
    }

    [Fact]
    public void ToEntity_WithValidModel_ReturnsCorrectEntity() {
        var ownerId = Guid.CreateVersion7();
        var portraitId = Guid.CreateVersion7();
        var tokenId = Guid.CreateVersion7();

        var model = new Asset {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Classification = new AssetClassification(AssetKind.Creature, "goblin", "goblin_warrior", null),
            Name = "Goblin Warrior",
            Description = "A fierce goblin",
            TokenSize = new(1, 1),
            StatBlocks = new Dictionary<int, Map<StatBlockValue>> {
                {
                    1, new Map<StatBlockValue>(new Dictionary<string, StatBlockValue> {
                        { "HP", new StatBlockValue(null, 15, null) },
                        { "AC", new StatBlockValue(null, 13, null) },
                        { "HasShield", new StatBlockValue(null, null, true) },
                        { "Weapon", new StatBlockValue("Scimitar", null, null) },
                    })
                },
            },
            IsPublic = true,
            IsPublished = true,
            IsDeleted = false,
            Tags = ["enemy", "humanoid"],
            Portrait = new ResourceMetadata {
                Id = portraitId,
                ResourceType = ResourceType.Portrait,
                Path = "assets/portraits/goblin.png",
                ContentType = "image/png",
                FileName = "goblin.png",
                FileLength = 50000,
                Size = new(256, 256),
                Duration = TimeSpan.Zero,
            },
            Tokens = [
                new ResourceMetadata {
                    Id = tokenId,
                    ResourceType = ResourceType.Token,
                    Path = "assets/tokens/goblin.png",
                    ContentType = "image/png",
                    FileName = "goblin_token.png",
                    FileLength = 25000,
                    Size = new(128, 128),
                    Duration = TimeSpan.Zero,
                },
            ],
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.Id.Should().Be(model.Id);
        result.OwnerId.Should().Be(ownerId);
        result.Kind.Should().Be(AssetKind.Creature);
        result.Category.Should().Be("goblin");
        result.Type.Should().Be("goblin_warrior");
        result.Subtype.Should().BeNull();
        result.Name.Should().Be("Goblin Warrior");
        result.Description.Should().Be("A fierce goblin");
        result.TokenSize.Should().BeEquivalentTo(new NamedSize(1, 1));
        var statBlock = result.StatBlock.ToList();
        statBlock.Should().HaveCount(4);
        statBlock.Should().Contain(sb => sb.Key == "HP" && sb.Level == 1 && sb.Value == "15");
        statBlock.Should().Contain(sb => sb.Key == "AC" && sb.Level == 1 && sb.Value == "13");
        statBlock.Should().Contain(sb => sb.Key == "HasShield" && sb.Level == 1 && sb.Value == "True");
        statBlock.Should().Contain(sb => sb.Key == "Weapon" && sb.Level == 1 && sb.Value == "Scimitar");
        result.IsPublic.Should().BeTrue();
        result.IsPublished.Should().BeTrue();
        result.IsDeleted.Should().BeFalse();
        result.Tags.Should().BeEquivalentTo(["enemy", "humanoid"]);
        result.PortraitId.Should().Be(portraitId);
        var assetTokens = result.AssetTokens.ToList();
        assetTokens.Should().HaveCount(1);
        assetTokens[0].TokenId.Should().Be(tokenId);
        assetTokens[0].AssetId.Should().Be(model.Id);
        assetTokens[0].Index.Should().Be(0);
    }

    [Fact]
    public void UpdateFrom_UpdatesAllProperties() {
        var entity = new Entities.Asset {
            Id = Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            Kind = AssetKind.Object,
            Category = "old_category",
            Type = "old_type",
            Subtype = "old_subtype",
            Name = "Old Name",
            Description = "Old Description",
            TokenSize = new(1, 1),
            StatBlock = [
                new Entities.AssetStatBlockValue {
                    AssetId = Guid.CreateVersion7(),
                    Level = 1,
                    Key = "OldStat",
                    Type = Entities.AssetStatBlockValueType.Text,
                    Value = "OldValue",
                },
            ],
            IsPublic = false,
            IsPublished = false,
            Tags = ["old_tag"],
            PortraitId = Guid.CreateVersion7(),
        };

        var newPortraitId = Guid.CreateVersion7();
        var model = new Asset {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Classification = new AssetClassification(AssetKind.Creature, "new_category", "new_type", "new_subtype"),
            Name = "New Name",
            Description = "New Description",
            TokenSize = new(2, 2),
            StatBlocks = new Dictionary<int, Map<StatBlockValue>> {
                {
                    1, new Map<StatBlockValue>(new Dictionary<string, StatBlockValue> {
                        { "NewStat", new StatBlockValue("NewValue", null, null) },
                    })
                },
            },
            IsPublic = true,
            IsPublished = true,
            IsDeleted = false,
            Tags = ["new_tag"],
            Portrait = new ResourceMetadata {
                Id = newPortraitId,
                ResourceType = ResourceType.Portrait,
                Path = "test/path",
                ContentType = "image/png",
                FileName = "test.png",
                FileLength = 1000,
                Size = new(100, 100),
                Duration = TimeSpan.Zero,
            },
            Tokens = [],
        };

        entity.UpdateFrom(model);

        entity.Kind.Should().Be(AssetKind.Creature);
        entity.Category.Should().Be("new_category");
        entity.Type.Should().Be("new_type");
        entity.Subtype.Should().Be("new_subtype");
        entity.Name.Should().Be("New Name");
        entity.Description.Should().Be("New Description");
        entity.TokenSize.Should().BeEquivalentTo(new NamedSize(2, 2));
        var statBlock = entity.StatBlock.ToList();
        statBlock.Should().HaveCount(1);
        statBlock[0].Key.Should().Be("NewStat");
        statBlock[0].Value.Should().Be("NewValue");
        entity.IsPublic.Should().BeTrue();
        entity.IsPublished.Should().BeTrue();
        entity.Tags.Should().BeEquivalentTo(["new_tag"]);
        entity.PortraitId.Should().Be(newPortraitId);
    }

    [Fact]
    public void ToEntity_WithMultipleLevelsOfStatBlocks_CreatesCorrectStatBlocks() {
        var model = new Asset {
            Id = Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            Classification = new AssetClassification(AssetKind.Creature, "goblin", "goblin_warrior", null),
            Name = "Leveling Goblin",
            Description = "A goblin that levels up",
            TokenSize = new(1, 1),
            StatBlocks = new Dictionary<int, Map<StatBlockValue>> {
                {
                    1, new Map<StatBlockValue>(new Dictionary<string, StatBlockValue> {
                        { "HP", new StatBlockValue(null, 15, null) },
                    })
                },
                {
                    5, new Map<StatBlockValue>(new Dictionary<string, StatBlockValue> {
                        { "HP", new StatBlockValue(null, 30, null) },
                    })
                },
                {
                    10, new Map<StatBlockValue>(new Dictionary<string, StatBlockValue> {
                        { "HP", new StatBlockValue(null, 50, null) },
                    })
                },
            },
            IsPublic = true,
            IsPublished = true,
            IsDeleted = false,
            Tags = [],
            Portrait = null,
            Tokens = [],
        };

        var result = model.ToEntity();

        var statBlock = result.StatBlock.ToList();
        statBlock.Should().HaveCount(3);
        statBlock.Should().Contain(sb => sb.Level == 1 && sb.Key == "HP" && sb.Value == "15");
        statBlock.Should().Contain(sb => sb.Level == 5 && sb.Key == "HP" && sb.Value == "30");
        statBlock.Should().Contain(sb => sb.Level == 10 && sb.Key == "HP" && sb.Value == "50");
    }
}
