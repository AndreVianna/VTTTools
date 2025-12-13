namespace VttTools.Data.Library;

public class LibraryMapperTests {
    [Fact]
    public void ToModel_World_WithValidEntity_ReturnsCorrectModel() {
        var ownerId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        var background = new Media.Entities.Resource {
            Id = backgroundId,
            ResourceType = ResourceType.Background,
            Path = "worlds/fantasy.jpg",
            ContentType = "image/jpeg",
            FileName = "fantasy.jpg",
            FileLength = 200000,
            Size = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };

        var entity = new Entities.World {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = "Fantasy World",
            Description = "A magical realm",
            BackgroundId = backgroundId,
            Background = background,
            IsPublished = true,
            IsPublic = false,
            Campaigns = [],
            Adventures = [],
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.OwnerId.Should().Be(ownerId);
        result.Name.Should().Be("Fantasy World");
        result.Description.Should().Be("A magical realm");
        result.Background.Should().NotBeNull();
        result.Background!.Id.Should().Be(backgroundId);
        result.IsPublished.Should().BeTrue();
        result.IsPublic.Should().BeFalse();
        result.Campaigns.Should().BeEmpty();
        result.Adventures.Should().BeEmpty();
    }

    [Fact]
    public void ToModel_World_WithNullEntity_ReturnsNull() {
        Entities.World? entity = null;

        var result = entity.ToModel();

        result.Should().BeNull();
    }

    [Fact]
    public void ToEntity_World_WithValidModel_ReturnsCorrectEntity() {
        var ownerId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        var model = new World {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = "Sci-Fi World",
            Description = "A futuristic setting",
            Background = new ResourceMetadata {
                Id = backgroundId,
                ResourceType = ResourceType.Background,
                Path = "worlds/scifi.jpg",
                ContentType = "image/jpeg",
                FileName = "scifi.jpg",
                FileLength = 250000,
                Size = new(2560, 1440),
                Duration = TimeSpan.Zero,
            },
            IsPublished = false,
            IsPublic = true,
            Campaigns = [],
            Adventures = [],
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.Id.Should().Be(model.Id);
        result.OwnerId.Should().Be(ownerId);
        result.Name.Should().Be("Sci-Fi World");
        result.Description.Should().Be("A futuristic setting");
        result.BackgroundId.Should().Be(backgroundId);
        result.IsPublished.Should().BeFalse();
        result.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void UpdateFrom_World_UpdatesAllProperties() {
        var entity = new Entities.World {
            Id = Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            Name = "Old World",
            Description = "Old Description",
            BackgroundId = Guid.CreateVersion7(),
            IsPublished = false,
            IsPublic = false,
        };

        var newBackgroundId = Guid.CreateVersion7();
        var model = new World {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = "New World",
            Description = "New Description",
            Background = new ResourceMetadata {
                Id = newBackgroundId,
                ResourceType = ResourceType.Background,
                Path = "test/path",
                ContentType = "image/png",
                FileName = "test.png",
                FileLength = 1000,
                Size = new(100, 100),
                Duration = TimeSpan.Zero,
            },
            IsPublished = true,
            IsPublic = true,
            Campaigns = [],
            Adventures = [],
        };

        entity.UpdateFrom(model);

        entity.Name.Should().Be("New World");
        entity.Description.Should().Be("New Description");
        entity.BackgroundId.Should().Be(newBackgroundId);
        entity.IsPublished.Should().BeTrue();
        entity.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void ToModel_Campaign_WithValidEntity_ReturnsCorrectModel() {
        var ownerId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        var background = new Media.Entities.Resource {
            Id = backgroundId,
            ResourceType = ResourceType.Background,
            Path = "campaigns/epic.jpg",
            ContentType = "image/jpeg",
            FileName = "epic.jpg",
            FileLength = 150000,
            Size = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };

        var entity = new Entities.Campaign {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = "Epic Campaign",
            Description = "An epic story",
            BackgroundId = backgroundId,
            Background = background,
            IsPublished = true,
            IsPublic = false,
            WorldId = null,
            World = null,
            Adventures = [],
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.OwnerId.Should().Be(ownerId);
        result.Name.Should().Be("Epic Campaign");
        result.Description.Should().Be("An epic story");
        result.Background.Should().NotBeNull();
        result.Background!.Id.Should().Be(backgroundId);
        result.IsPublished.Should().BeTrue();
        result.IsPublic.Should().BeFalse();
        result.World.Should().BeNull();
        result.Adventures.Should().BeEmpty();
    }

    [Fact]
    public void ToEntity_Campaign_WithValidModel_ReturnsCorrectEntity() {
        var ownerId = Guid.CreateVersion7();
        var worldId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        var model = new Campaign {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = "New Campaign",
            Description = "A new adventure",
            Background = new ResourceMetadata {
                Id = backgroundId,
                ResourceType = ResourceType.Background,
                Path = "campaigns/new.jpg",
                ContentType = "image/jpeg",
                FileName = "new.jpg",
                FileLength = 100000,
                Size = new(1920, 1080),
                Duration = TimeSpan.Zero,
            },
            IsPublished = false,
            IsPublic = false,
            World = null,
            Adventures = [],
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.Id.Should().Be(model.Id);
        result.OwnerId.Should().Be(ownerId);
        result.WorldId.Should().BeNull();
        result.Name.Should().Be("New Campaign");
        result.Description.Should().Be("A new adventure");
        result.BackgroundId.Should().Be(backgroundId);
        result.IsPublished.Should().BeFalse();
        result.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void UpdateFrom_Campaign_UpdatesAllProperties() {
        var entity = new Entities.Campaign {
            Id = Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            WorldId = Guid.CreateVersion7(),
            Name = "Old Campaign",
            Description = "Old Description",
            BackgroundId = Guid.CreateVersion7(),
            IsPublished = false,
            IsPublic = false,
        };

        var newBackgroundId = Guid.CreateVersion7();
        var model = new Campaign {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = "Updated Campaign",
            Description = "Updated Description",
            Background = new ResourceMetadata {
                Id = newBackgroundId,
                ResourceType = ResourceType.Background,
                Path = "test/path",
                ContentType = "image/png",
                FileName = "test.png",
                FileLength = 1000,
                Size = new(100, 100),
                Duration = TimeSpan.Zero,
            },
            IsPublished = true,
            IsPublic = true,
            World = null,
            Adventures = [],
        };

        entity.UpdateFrom(model);

        entity.Name.Should().Be("Updated Campaign");
        entity.Description.Should().Be("Updated Description");
        entity.BackgroundId.Should().Be(newBackgroundId);
        entity.IsPublished.Should().BeTrue();
        entity.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void ToModel_Adventure_WithValidEntity_ReturnsCorrectModel() {
        var ownerId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        var background = new Media.Entities.Resource {
            Id = backgroundId,
            ResourceType = ResourceType.Background,
            Path = "adventures/dungeon.jpg",
            ContentType = "image/jpeg",
            FileName = "dungeon.jpg",
            FileLength = 180000,
            Size = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };

        var entity = new Entities.Adventure {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = "Dungeon Crawl",
            Description = "Explore the depths",
            Style = AdventureStyle.DungeonCrawl,
            BackgroundId = backgroundId,
            Background = background,
            IsOneShot = false,
            IsPublished = true,
            IsPublic = false,
            WorldId = null,
            World = null,
            CampaignId = null,
            Campaign = null,
            Encounters = [],
        };

        var result = entity.ToModel();

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.OwnerId.Should().Be(ownerId);
        result.Name.Should().Be("Dungeon Crawl");
        result.Description.Should().Be("Explore the depths");
        result.Style.Should().Be(AdventureStyle.DungeonCrawl);
        result.Background.Should().NotBeNull();
        result.Background!.Id.Should().Be(backgroundId);
        result.IsOneShot.Should().BeFalse();
        result.IsPublished.Should().BeTrue();
        result.IsPublic.Should().BeFalse();
        result.World.Should().BeNull();
        result.Campaign.Should().BeNull();
        result.Encounters.Should().BeEmpty();
    }

    [Fact]
    public void ToEntity_Adventure_WithValidModel_ReturnsCorrectEntity() {
        var ownerId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        var model = new Adventure {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = "One Shot Adventure",
            Description = "A quick adventure",
            Style = AdventureStyle.OpenWorld,
            Background = new ResourceMetadata {
                Id = backgroundId,
                ResourceType = ResourceType.Background,
                Path = "adventures/oneshot.jpg",
                ContentType = "image/jpeg",
                FileName = "oneshot.jpg",
                FileLength = 120000,
                Size = new(1920, 1080),
                Duration = TimeSpan.Zero,
            },
            IsOneShot = true,
            IsPublished = false,
            IsPublic = true,
            World = null,
            Campaign = null,
            Encounters = [],
        };

        var result = model.ToEntity();

        result.Should().NotBeNull();
        result.Id.Should().Be(model.Id);
        result.OwnerId.Should().Be(ownerId);
        result.CampaignId.Should().BeNull();
        result.Name.Should().Be("One Shot Adventure");
        result.Description.Should().Be("A quick adventure");
        result.Style.Should().Be(AdventureStyle.OpenWorld);
        result.BackgroundId.Should().Be(backgroundId);
        result.IsOneShot.Should().BeTrue();
        result.IsPublished.Should().BeFalse();
        result.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void UpdateFrom_Adventure_UpdatesAllProperties() {
        var entity = new Entities.Adventure {
            Id = Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            WorldId = Guid.CreateVersion7(),
            CampaignId = null,
            Name = "Old Adventure",
            Description = "Old Description",
            Style = AdventureStyle.OpenWorld,
            BackgroundId = Guid.CreateVersion7(),
            IsOneShot = false,
            IsPublished = false,
            IsPublic = false,
        };

        var newBackgroundId = Guid.CreateVersion7();
        var model = new Adventure {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = "Updated Adventure",
            Description = "Updated Description",
            Style = AdventureStyle.OpenWorld,
            Background = new ResourceMetadata {
                Id = newBackgroundId,
                ResourceType = ResourceType.Background,
                Path = "test/path",
                ContentType = "image/png",
                FileName = "test.png",
                FileLength = 1000,
                Size = new(100, 100),
                Duration = TimeSpan.Zero,
            },
            IsOneShot = true,
            IsPublished = true,
            IsPublic = true,
            World = null,
            Campaign = null,
            Encounters = [],
        };

        entity.UpdateFrom(model);

        entity.Name.Should().Be("Updated Adventure");
        entity.Description.Should().Be("Updated Description");
        entity.Style.Should().Be(AdventureStyle.OpenWorld);
        entity.BackgroundId.Should().Be(newBackgroundId);
        entity.IsOneShot.Should().BeTrue();
        entity.IsPublished.Should().BeTrue();
        entity.IsPublic.Should().BeTrue();
    }
}
