using AdventureEntity = VttTools.Data.Library.Adventures.Entities.Adventure;
using AdventureModel = VttTools.Library.Adventures.Model.Adventure;
using CampaignEntity = VttTools.Data.Library.Campaigns.Entities.Campaign;
using CampaignModel = VttTools.Library.Campaigns.Model.Campaign;
using WorldEntity = VttTools.Data.Library.Worlds.Entities.World;
using WorldModel = VttTools.Library.Worlds.Model.World;

namespace VttTools.Data.Library;

public class LibraryMapperTests {
    [Fact]
    public void ToModel_World_WithValidEntity_ReturnsCorrectModel() {
        var ownerId = Guid.CreateVersion7();
        var worldId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        var background = new Media.Entities.Resource {
            Id = backgroundId,
            Path = "worlds/fantasy.jpg",
            ContentType = "image/jpeg",
            FileName = "fantasy.jpg",
            FileSize = 200000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };

        var entity = new WorldEntity {
            Id = worldId,
            OwnerId = ownerId,
            Name = "Fantasy World",
            Description = "A magical realm",
            IsPublished = true,
            IsPublic = false,
            BackgroundId = background.Id,
            Background = background,
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
        WorldEntity? entity = null;

        var result = entity.ToModel();

        result.Should().BeNull();
    }

    [Fact]
    public void ToEntity_World_WithValidModel_ReturnsCorrectEntity() {
        var ownerId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        var model = new WorldModel {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = "Sci-Fi World",
            Description = "A futuristic setting",
            Background = new ResourceMetadata {
                Id = backgroundId,
                Path = "worlds/scifi.jpg",
                ContentType = "image/jpeg",
                FileName = "scifi.jpg",
                FileSize = 250000,
                Dimensions = new(2560, 1440),
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
        result.IsPublished.Should().BeFalse();
        result.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void UpdateFrom_World_UpdatesAllProperties() {
        var worldId = Guid.CreateVersion7();
        var entity = new WorldEntity {
            Id = worldId,
            OwnerId = Guid.CreateVersion7(),
            Name = "Old World",
            Description = "Old Description",
            IsPublished = false,
            IsPublic = false,
        };

        var newBackgroundId = Guid.CreateVersion7();
        var model = new WorldModel {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = "New World",
            Description = "New Description",
            Background = new ResourceMetadata {
                Id = newBackgroundId,
                Path = "test/path",
                ContentType = "image/png",
                FileName = "test.png",
                FileSize = 1000,
                Dimensions = new(100, 100),
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
        entity.IsPublished.Should().BeTrue();
        entity.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void ToModel_Campaign_WithValidEntity_ReturnsCorrectModel() {
        var ownerId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        var background = new Media.Entities.Resource {
            Id = backgroundId,
            Path = "campaigns/epic.jpg",
            ContentType = "image/jpeg",
            FileName = "epic.jpg",
            FileSize = 150000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };

        var entity = new CampaignEntity {
            Id = campaignId,
            OwnerId = ownerId,
            Name = "Epic Campaign",
            Description = "An epic story",
            IsPublished = true,
            IsPublic = false,
            WorldId = null,
            World = null,
            BackgroundId = background.Id,
            Background = background,
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
        var backgroundId = Guid.CreateVersion7();

        var model = new CampaignModel {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = "New Campaign",
            Description = "A new adventure",
            Background = new ResourceMetadata {
                Id = backgroundId,
                Path = "campaigns/new.jpg",
                ContentType = "image/jpeg",
                FileName = "new.jpg",
                FileSize = 100000,
                Dimensions = new(1920, 1080),
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
        result.IsPublished.Should().BeFalse();
        result.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void UpdateFrom_Campaign_UpdatesAllProperties() {
        var campaignId = Guid.CreateVersion7();
        var entity = new CampaignEntity {
            Id = campaignId,
            OwnerId = Guid.CreateVersion7(),
            WorldId = Guid.CreateVersion7(),
            Name = "Old Campaign",
            Description = "Old Description",
            IsPublished = false,
            IsPublic = false,
        };

        var newBackgroundId = Guid.CreateVersion7();
        var model = new CampaignModel {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = "Updated Campaign",
            Description = "Updated Description",
            Background = new ResourceMetadata {
                Id = newBackgroundId,
                Path = "test/path",
                ContentType = "image/png",
                FileName = "test.png",
                FileSize = 1000,
                Dimensions = new(100, 100),
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
        entity.IsPublished.Should().BeTrue();
        entity.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void ToModel_Adventure_WithValidEntity_ReturnsCorrectModel() {
        var ownerId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var backgroundId = Guid.CreateVersion7();

        var background = new Media.Entities.Resource {
            Id = backgroundId,
            Path = "adventures/dungeon.jpg",
            ContentType = "image/jpeg",
            FileName = "dungeon.jpg",
            FileSize = 180000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };

        var entity = new AdventureEntity {
            Id = adventureId,
            OwnerId = ownerId,
            Name = "Dungeon Crawl",
            Description = "Explore the depths",
            Style = AdventureStyle.DungeonCrawl,
            IsOneShot = false,
            IsPublished = true,
            IsPublic = false,
            WorldId = null,
            World = null,
            CampaignId = null,
            Campaign = null,
            BackgroundId = background.Id,
            Background = background,
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
        var backgroundId = Guid.CreateVersion7();

        var model = new AdventureModel {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId,
            Name = "One Shot Adventure",
            Description = "A quick adventure",
            Style = AdventureStyle.OpenWorld,
            Background = new ResourceMetadata {
                Id = backgroundId,
                Path = "adventures/oneshot.jpg",
                ContentType = "image/jpeg",
                FileName = "oneshot.jpg",
                FileSize = 120000,
                Dimensions = new(1920, 1080),
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
        result.IsOneShot.Should().BeTrue();
        result.IsPublished.Should().BeFalse();
        result.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void UpdateFrom_Adventure_UpdatesAllProperties() {
        var adventureId = Guid.CreateVersion7();
        var entity = new AdventureEntity {
            Id = adventureId,
            OwnerId = Guid.CreateVersion7(),
            WorldId = Guid.CreateVersion7(),
            CampaignId = null,
            Name = "Old Adventure",
            Description = "Old Description",
            Style = AdventureStyle.OpenWorld,
            IsOneShot = false,
            IsPublished = false,
            IsPublic = false,
        };

        var newBackgroundId = Guid.CreateVersion7();
        var model = new AdventureModel {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = "Updated Adventure",
            Description = "Updated Description",
            Style = AdventureStyle.OpenWorld,
            Background = new ResourceMetadata {
                Id = newBackgroundId,
                Path = "test/path",
                ContentType = "image/png",
                FileName = "test.png",
                FileSize = 1000,
                Dimensions = new(100, 100),
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
        entity.IsOneShot.Should().BeTrue();
        entity.IsPublished.Should().BeTrue();
        entity.IsPublic.Should().BeTrue();
    }
}
