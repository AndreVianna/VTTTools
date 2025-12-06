namespace VttTools.Library.Services;

public class WorldServiceTests {
    private readonly IWorldStorage _worldStorage;
    private readonly ICampaignStorage _campaignStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly WorldService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public WorldServiceTests() {
        _worldStorage = Substitute.For<IWorldStorage>();
        _campaignStorage = Substitute.For<ICampaignStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new(_worldStorage, _campaignStorage, _mediaStorage, NullLogger<WorldService>.Instance);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GetWorldsAsync_CallsStorage() {
        // Arrange
        var worlds = new World[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test World 1" },
            new() { Id = Guid.CreateVersion7(), Name = "Test World 2" },
        };
        _worldStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(worlds);

        // Act
        var result = await _service.GetWorldsAsync(_ct);

        // Assert
        result.Should().BeEquivalentTo(worlds);
        await _worldStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetWorldsAsync_WithFilter_CallsStorage() {
        // Arrange
        const string filterDefinition = "AvailableTo:user-123";
        var worlds = new World[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test World 1" },
        };
        _worldStorage.GetManyAsync(filterDefinition, Arg.Any<CancellationToken>()).Returns(worlds);

        // Act
        var result = await _service.GetWorldsAsync(filterDefinition, _ct);

        // Assert
        result.Should().BeEquivalentTo(worlds);
        await _worldStorage.Received(1).GetManyAsync(filterDefinition, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetWorldByIdAsync_CallsStorage() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var world = new World { Id = worldId, Name = "Test World" };
        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.GetWorldByIdAsync(worldId, _ct);

        // Assert
        result.Should().BeEquivalentTo(world);
        await _worldStorage.Received(1).GetByIdAsync(worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateWorldAsync_CreatesNewWorld() {
        // Arrange
        var request = new CreateWorldData {
            Name = "New World",
            Description = "World description",
            IsPublished = false,
            IsPublic = false,
        };

        // Act
        var result = await _service.CreateWorldAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name);
        result.Value.Description.Should().Be(request.Description);
        result.Value.IsPublished.Should().BeFalse();
        result.Value.IsPublic.Should().BeFalse();
        result.Value.Background.Should().BeNull();
        result.Value.Id.Should().NotBe(Guid.Empty);
        result.Value.Campaigns.Should().BeEmpty();
        result.Value.OwnerId.Should().Be(_userId);
        await _worldStorage.Received(1).AddAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateWorldAsync_WithBackgroundId_CreatesWorldWithBackground() {
        // Arrange
        var backgroundId = Guid.CreateVersion7();
        var background = new ResourceInfo {
            Id = backgroundId,
            ResourceType = ResourceType.Background,
            Path = "test/background.jpg",
            FileName = "background.jpg",
            ContentType = "image/jpeg",
        };
        var request = new CreateWorldData {
            Name = "New World",
            Description = "World description",
            BackgroundId = backgroundId,
            IsPublished = false,
            IsPublic = false,
        };

        _mediaStorage.FindByIdAsync(backgroundId, Arg.Any<CancellationToken>()).Returns(background);

        // Act
        var result = await _service.CreateWorldAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Background.Should().NotBeNull();
        result.Value.Background.Should().BeEquivalentTo(background);
        await _mediaStorage.Received(1).FindByIdAsync(backgroundId, Arg.Any<CancellationToken>());
        await _worldStorage.Received(1).AddAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateWorldAsync_WithEmptyName_ReturnsFailure() {
        // Arrange
        var request = new CreateWorldData {
            Name = "",
            Description = "World description",
        };

        // Act
        var result = await _service.CreateWorldAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().AddAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateWorldAsync_WithWhitespaceName_ReturnsFailure() {
        // Arrange
        var request = new CreateWorldData {
            Name = "   ",
            Description = "World description",
        };

        // Act
        var result = await _service.CreateWorldAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().AddAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateWorldAsync_WithNullName_ReturnsFailure() {
        // Arrange
        var request = new CreateWorldData {
            Name = null!,
            Description = "World description",
        };

        // Act
        var result = await _service.CreateWorldAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().AddAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneWorldAsync_WithOwner_ClonesWorld() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Description = "World description",
            IsPublished = false,
            IsPublic = false,
            Background = new ResourceInfo {
                Id = Guid.CreateVersion7(),
                ResourceType = ResourceType.Background,
                Path = "worlds/background.jpg",
                ContentType = "image/jpeg",
                Size = new Size(1920, 1080),
            },
        };
        var allWorlds = new World[] { world };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);
        _worldStorage.GetManyAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(allWorlds);

        // Act
        var result = await _service.CloneWorldAsync(_userId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().NotBe(world.Name);
        result.Value.OwnerId.Should().Be(_userId);
        await _worldStorage.Received(1).AddAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneWorldAsync_WithNonOwnerPublicWorld_ClonesWorld() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Description = "World description",
            IsPublished = true,
            IsPublic = true,
        };
        var allWorlds = Array.Empty<World>();

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);
        _worldStorage.GetManyAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(allWorlds);

        // Act
        var result = await _service.CloneWorldAsync(nonOwnerId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.OwnerId.Should().Be(nonOwnerId);
        await _worldStorage.Received(1).AddAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneWorldAsync_WithNonOwnerPrivateWorld_ReturnsNotAllowed() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Description = "World description",
            IsPublished = false,
            IsPublic = false,
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.CloneWorldAsync(nonOwnerId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().AddAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneWorldAsync_WithNonExistentWorld_ReturnsNotFound() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns((World?)null);

        // Act
        var result = await _service.CloneWorldAsync(_userId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().AddAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneWorldAsync_WithNamingConflict_RenamesOriginalAndClone() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Description = "World description",
            IsPublished = false,
            IsPublic = false,
        };
        var existingWorld = new World {
            Id = Guid.CreateVersion7(),
            Name = "World (Copy)",
            OwnerId = _userId,
        };
        var allWorlds = new World[] { world, existingWorld };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);
        _worldStorage.GetManyAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(allWorlds);

        // Act
        var result = await _service.CloneWorldAsync(_userId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _worldStorage.Received(1).UpdateAsync(Arg.Is<World>(e => e.Name != "World"), Arg.Any<CancellationToken>());
        await _worldStorage.Received(1).AddAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateWorldAsync_WithOwner_UpdatesWorld() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "Old Name",
            OwnerId = _userId,
            Description = "Old description",
            Background = new ResourceInfo {
                Id = Guid.CreateVersion7(),
                ResourceType = ResourceType.Background,
                Path = "test/background",
                FileName = "background.png",
                ContentType = "image/png",
            },
        };
        var request = new UpdatedWorldData {
            Name = "Updated Name",
            Description = "Updated description",
            IsPublished = true,
            IsPublic = true,
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.UpdateWorldAsync(_userId, worldId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name.Value);
        result.Value.Description.Should().Be(request.Description.Value);
        result.Value.IsPublished.Should().BeTrue();
        result.Value.IsPublic.Should().BeTrue();
        result.Value.Background.Should().NotBeNull();
        result.Value.Id.Should().Be(worldId);
        result.Value.OwnerId.Should().Be(_userId);
        await _worldStorage.Received(1).UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateWorldAsync_WithOnlyNameUpdate_OnlyUpdatesName() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "Old Name",
            OwnerId = _userId,
            Description = "Old description",
            Background = new() {
                Id = Guid.CreateVersion7(),
                ResourceType = ResourceType.Background,
                Path = "test/world-background.jpg",
                ContentType = "image/jpeg",
                Size = new Size(1920, 1080),
            },
        };
        var request = new UpdatedWorldData {
            Name = "Updated Name",
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.UpdateWorldAsync(_userId, worldId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name.Value);
        result.Value.Description.Should().Be(world.Description);
        result.Value.Background.Should().NotBeNull();
        result.Value.IsPublished.Should().BeFalse();
        result.Value.IsPublic.Should().BeFalse();
        result.Value.Id.Should().Be(worldId);
        result.Value.OwnerId.Should().Be(_userId);
        await _worldStorage.Received(1).UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateWorldAsync_WithBackgroundUpdate_UpdatesBackground() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var newBackgroundId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Description = "World description",
            Background = null,
        };
        var newBackground = new ResourceInfo {
            Id = newBackgroundId,
            ResourceType = ResourceType.Background,
            Path = "test/new-background.jpg",
            ContentType = "image/jpeg",
        };
        var request = new UpdatedWorldData {
            BackgroundId = newBackgroundId,
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);
        _mediaStorage.FindByIdAsync(newBackgroundId, Arg.Any<CancellationToken>()).Returns(newBackground);

        // Act
        var result = await _service.UpdateWorldAsync(_userId, worldId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Background.Should().NotBeNull();
        result.Value.Background.Should().BeEquivalentTo(newBackground);
        await _mediaStorage.Received(1).FindByIdAsync(newBackgroundId, Arg.Any<CancellationToken>());
        await _worldStorage.Received(1).UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateWorldAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
        };
        var request = new UpdatedWorldData {
            Name = "Updated Name",
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.UpdateWorldAsync(nonOwnerId, worldId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateWorldAsync_WithNonExistentWorld_ReturnsNotFound() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var request = new UpdatedWorldData {
            Name = "Updated Name",
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns((World?)null);

        // Act
        var result = await _service.UpdateWorldAsync(_userId, worldId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteWorldAsync_WithOwner_DeletesWorld() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.DeleteWorldAsync(_userId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _worldStorage.Received(1).DeleteAsync(worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteWorldAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.DeleteWorldAsync(nonOwnerId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteWorldAsync_WithNonExistentWorld_ReturnsNotFound() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns((World?)null);

        // Act
        var result = await _service.DeleteWorldAsync(_userId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignsAsync_ReturnsCampaigns() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Campaigns = [
                new() { Id = Guid.CreateVersion7(), Name = "Campaign 1" },
                new() { Id = Guid.CreateVersion7(), Name = "Campaign 2" },
            ],
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.GetCampaignsAsync(worldId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(world.Campaigns);
        await _worldStorage.Received(1).GetByIdAsync(worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignsAsync_WithNonExistentWorld_ReturnsEmpty() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns((World?)null);

        // Act
        var result = await _service.GetCampaignsAsync(worldId, _ct);

        // Assert
        result.Should().BeEmpty();
        await _worldStorage.Received(1).GetByIdAsync(worldId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewCampaignAsync_WithOwner_AddsCampaign() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Campaigns = [],
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.AddNewCampaignAsync(_userId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.World.Should().BeEquivalentTo(world);
        await _worldStorage.Received(1).UpdateAsync(Arg.Is<World>(e => e.Campaigns.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewCampaignAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Campaigns = [],
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.AddNewCampaignAsync(nonOwnerId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewCampaignAsync_WithNonExistentWorld_ReturnsNotFound() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns((World?)null);

        // Act
        var result = await _service.AddNewCampaignAsync(_userId, worldId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignAsync_WithOwner_AddsCampaign() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Campaigns = [],
        };
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Description = "Campaign description",
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.AddClonedCampaignAsync(_userId, worldId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.World.Should().BeEquivalentTo(world);
        result.Value.Name.Should().NotBe(campaign.Name);
        await _worldStorage.Received(1).UpdateAsync(Arg.Is<World>(e => e.Campaigns.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Campaigns = [],
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.AddClonedCampaignAsync(nonOwnerId, worldId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignAsync_WithNonExistentWorld_ReturnsNotFound() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns((World?)null);

        // Act
        var result = await _service.AddClonedCampaignAsync(_userId, worldId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignAsync_WithNonExistentCampaign_ReturnsNotFound() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Campaigns = [],
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns((Campaign?)null);

        // Act
        var result = await _service.AddClonedCampaignAsync(_userId, worldId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignAsync_WithNamingConflict_RenamesOriginalAndClone() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Campaigns = [
                new() { Id = Guid.CreateVersion7(), Name = "Campaign (Copy)" },
            ],
        };
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Description = "Campaign description",
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.AddClonedCampaignAsync(_userId, worldId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _campaignStorage.Received(1).UpdateAsync(Arg.Is<Campaign>(c => c.Name != "Campaign"), Arg.Any<CancellationToken>());
        await _worldStorage.Received(1).UpdateAsync(Arg.Is<World>(e => e.Campaigns.Count == 2), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveCampaignAsync_WithOwner_RemovesCampaign() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Campaigns = [
                new() { Id = campaignId, Name = "Campaign" },
            ],
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.RemoveCampaignAsync(_userId, worldId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _worldStorage.Received(1).UpdateAsync(Arg.Is<World>(e => e.Campaigns.Count == 0), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveCampaignAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Campaigns = [
                new() { Id = campaignId, Name = "Campaign" },
            ],
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.RemoveCampaignAsync(nonOwnerId, worldId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveCampaignAsync_WithNonExistentWorld_ReturnsNotFound() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns((World?)null);

        // Act
        var result = await _service.RemoveCampaignAsync(_userId, worldId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveCampaignAsync_WithNonExistentCampaign_ReturnsNotFound() {
        // Arrange
        var worldId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var world = new World {
            Id = worldId,
            Name = "World",
            OwnerId = _userId,
            Campaigns = [],
        };

        _worldStorage.GetByIdAsync(worldId, Arg.Any<CancellationToken>()).Returns(world);

        // Act
        var result = await _service.RemoveCampaignAsync(_userId, worldId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _worldStorage.DidNotReceive().UpdateAsync(Arg.Any<World>(), Arg.Any<CancellationToken>());
    }
}