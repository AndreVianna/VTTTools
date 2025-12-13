namespace VttTools.Data.Media;

public class MediaMapperTests {
    [Fact]
    public void ToModel_WithValidEntity_ReturnsCorrectModel() {
        var ownerId = Guid.CreateVersion7();
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Background,
            Classification = new Entities.ResourceClassification {
                Kind = "environment",
                Category = "dungeon",
                Type = "cave",
                Subtype = "underground",
            },
            Path = "assets/backgrounds/cave.jpg",
            ContentType = "image/jpeg",
            FileName = "cave.jpg",
            FileLength = 250000,
            Size = new(1920, 1080),
            Duration = TimeSpan.Zero,
            Features = [
                new Entities.ResourceFeature {
                    ResourceId = Guid.CreateVersion7(),
                    Key = "mood",
                    Index = 0,
                    Value = "dark",
                },
                new Entities.ResourceFeature {
                    ResourceId = Guid.CreateVersion7(),
                    Key = "mood",
                    Index = 1,
                    Value = "mysterious",
                },
                new Entities.ResourceFeature {
                    ResourceId = Guid.CreateVersion7(),
                    Key = "lighting",
                    Index = 0,
                    Value = "dim",
                },
            ],
            OwnerId = ownerId,
            IsPublished = true,
            IsPublic = false,
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.ResourceType.Should().Be(ResourceType.Background);
        result.Classification.Should().NotBeNull();
        result.Classification.Kind.Should().Be("environment");
        result.Classification.Category.Should().Be("dungeon");
        result.Classification.Type.Should().Be("cave");
        result.Classification.Subtype.Should().Be("underground");
        result.Path.Should().Be("assets/backgrounds/cave.jpg");
        result.ContentType.Should().Be("image/jpeg");
        result.FileName.Should().Be("cave.jpg");
        result.FileLength.Should().Be(250000);
        result.Size.Should().Be(new Size(1920, 1080));
        result.Duration.Should().Be(TimeSpan.Zero);
        result.Features.Should().ContainKey("mood");
        result.Features["mood"].Should().BeEquivalentTo(["dark", "mysterious"]);
        result.Features["lighting"].Should().BeEquivalentTo(["dim"]);
        result.OwnerId.Should().Be(ownerId);
        result.IsPublished.Should().BeTrue();
        result.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void ToModel_WithNullEntity_ReturnsNull() {
        Entities.Resource? entity = null;

        var result = entity.ToModel();

        result.Should().BeNull();
    }

    [Fact]
    public void ToModel_WithoutFeatures_ReturnsModelWithEmptyFeatures() {
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Token,
            Classification = new Entities.ResourceClassification {
                Kind = "character",
                Category = "humanoid",
                Type = "elf",
                Subtype = null,
            },
            Path = "assets/tokens/elf.png",
            ContentType = "image/png",
            FileName = "elf.png",
            FileLength = 50000,
            Size = new(256, 256),
            Duration = TimeSpan.Zero,
            Features = [],
            OwnerId = Guid.CreateVersion7(),
            IsPublished = false,
            IsPublic = false,
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Features.Should().BeEmpty();
    }

    [Fact]
    public void ToModel_WithAudioResource_IncludesDuration() {
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.AmbientSound,
            Classification = new Entities.ResourceClassification {
                Kind = "audio",
                Category = "ambient",
                Type = "nature",
                Subtype = "forest",
            },
            Path = "assets/audio/forest.mp3",
            ContentType = "audio/mpeg",
            FileName = "forest.mp3",
            FileLength = 1500000,
            Size = new(0, 0),
            Duration = TimeSpan.FromMinutes(3),
            Features = [],
            OwnerId = Guid.CreateVersion7(),
            IsPublished = true,
            IsPublic = true,
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Duration.Should().Be(TimeSpan.FromMinutes(3));
        result.ResourceType.Should().Be(ResourceType.AmbientSound);
    }

    [Fact]
    public void ToEntity_WithValidModel_ReturnsCorrectEntity() {
        var ownerId = Guid.CreateVersion7();
        var model = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Background,
            Classification = new ResourceClassification("environment", "castle", "throne_room", "royal"),
            Path = "assets/backgrounds/throne.jpg",
            ContentType = "image/jpeg",
            FileName = "throne.jpg",
            FileLength = 300000,
            Size = new(2560, 1440),
            Duration = TimeSpan.Zero,
            Features = new Map<HashSet<string>> {
                { "style", ["medieval", "grand"] },
                { "lighting", ["bright"] },
            },
            OwnerId = ownerId,
            IsPublished = true,
            IsPublic = false,
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.Id.Should().Be(model.Id);
        result.ResourceType.Should().Be(ResourceType.Background);
        result.Classification.Should().NotBeNull();
        result.Classification.Kind.Should().Be("environment");
        result.Classification.Category.Should().Be("castle");
        result.Classification.Type.Should().Be("throne_room");
        result.Classification.Subtype.Should().Be("royal");
        result.Path.Should().Be("assets/backgrounds/throne.jpg");
        result.ContentType.Should().Be("image/jpeg");
        result.FileName.Should().Be("throne.jpg");
        result.FileLength.Should().Be(300000);
        result.Size.Should().Be(new Size(2560, 1440));
        result.Duration.Should().Be(TimeSpan.Zero);
        result.Features.Should().HaveCount(3);
        result.Features.Should().Contain(f => f.Key == "style" && f.Value == "medieval");
        result.Features.Should().Contain(f => f.Key == "style" && f.Value == "grand");
        result.Features.Should().Contain(f => f.Key == "lighting" && f.Value == "bright");
        result.OwnerId.Should().Be(ownerId);
        result.IsPublished.Should().BeTrue();
        result.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void ToEntity_WithEmptyFeatures_ReturnsEntityWithEmptyFeaturesList() {
        var model = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Portrait,
            Classification = new ResourceClassification("character", "humanoid", "dwarf", null),
            Path = "assets/portraits/dwarf.png",
            ContentType = "image/png",
            FileName = "dwarf.png",
            FileLength = 100000,
            Size = new(512, 512),
            Duration = TimeSpan.Zero,
            Features = [],
            OwnerId = Guid.CreateVersion7(),
            IsPublished = false,
            IsPublic = false,
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.Features.Should().BeEmpty();
    }

    [Fact]
    public void UpdateFrom_UpdatesAllProperties() {
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Background,
            Classification = new Entities.ResourceClassification {
                Kind = "old_kind",
                Category = "old_category",
                Type = "old_type",
                Subtype = "old_subtype",
            },
            Path = "old/path.jpg",
            ContentType = "image/jpeg",
            FileName = "old.jpg",
            FileLength = 100000,
            Size = new(800, 600),
            Duration = TimeSpan.Zero,
            Features = [
                new Entities.ResourceFeature {
                    ResourceId = Guid.CreateVersion7(),
                    Key = "old_key",
                    Index = 0,
                    Value = "old_value",
                },
            ],
        };

        var model = new ResourceMetadata {
            Id = entity.Id,
            ResourceType = ResourceType.Token,
            Classification = new ResourceClassification("new_kind", "new_category", "new_type", "new_subtype"),
            Path = "new/path.png",
            ContentType = "image/png",
            FileName = "new.png",
            FileLength = 200000,
            Size = new(1024, 1024),
            Duration = TimeSpan.FromSeconds(5),
            Features = new Map<HashSet<string>> {
                { "new_key", ["new_value1", "new_value2"] },
            },
        };

        entity.UpdateFrom(model);

        entity.ResourceType.Should().Be(ResourceType.Token);
        entity.Classification.Kind.Should().Be("new_kind");
        entity.Classification.Category.Should().Be("new_category");
        entity.Classification.Type.Should().Be("new_type");
        entity.Classification.Subtype.Should().Be("new_subtype");
        entity.Path.Should().Be("new/path.png");
        entity.ContentType.Should().Be("image/png");
        entity.FileName.Should().Be("new.png");
        entity.FileLength.Should().Be(200000);
        entity.Size.Should().Be(new Size(1024, 1024));
        entity.Duration.Should().Be(TimeSpan.FromSeconds(5));
        entity.Features.Should().HaveCount(2);
        entity.Features.Should().Contain(f => f.Key == "new_key" && f.Value == "new_value1");
        entity.Features.Should().Contain(f => f.Key == "new_key" && f.Value == "new_value2");
    }

    [Fact]
    public void UpdateFrom_WithNullSubtype_HandlesClearingSubtype() {
        var entity = new Entities.Resource {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Background,
            Classification = new Entities.ResourceClassification {
                Kind = "environment",
                Category = "forest",
                Type = "clearing",
                Subtype = "daytime",
            },
            Path = "test/path.jpg",
            ContentType = "image/jpeg",
            FileName = "test.jpg",
            FileLength = 100000,
            Size = new(1920, 1080),
            Duration = TimeSpan.Zero,
            Features = [],
        };

        var model = new ResourceMetadata {
            Id = entity.Id,
            ResourceType = ResourceType.Background,
            Classification = new ResourceClassification("environment", "forest", "clearing", null),
            Path = "test/path.jpg",
            ContentType = "image/jpeg",
            FileName = "test.jpg",
            FileLength = 100000,
            Size = new(1920, 1080),
            Duration = TimeSpan.Zero,
            Features = [],
        };

        entity.UpdateFrom(model);

        entity.Classification.Subtype.Should().BeNull();
    }
}
