namespace VttTools.Library.Services;

public class CampaignServiceTests {
    private readonly ICampaignStorage _campaignStorage;
    private readonly IAdventureStorage _adventureStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly CampaignService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public CampaignServiceTests() {
        _campaignStorage = Substitute.For<ICampaignStorage>();
        _adventureStorage = Substitute.For<IAdventureStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new(_campaignStorage, _adventureStorage, _mediaStorage, NullLogger<CampaignService>.Instance);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GetCampaignsAsync_CallsStorage() {
        // Arrange
        var campaigns = new Campaign[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test Campaign 1" },
            new() { Id = Guid.CreateVersion7(), Name = "Test Campaign 2" },
        };
        _campaignStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(campaigns);

        // Act
        var result = await _service.GetCampaignsAsync(_ct);

        // Assert
        result.Should().BeEquivalentTo(campaigns);
        await _campaignStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignsAsync_WithFilter_CallsStorage() {
        // Arrange
        const string filterDefinition = "AvailableTo:user-123";
        var campaigns = new Campaign[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test Campaign 1" },
        };
        _campaignStorage.GetManyAsync(filterDefinition, Arg.Any<CancellationToken>()).Returns(campaigns);

        // Act
        var result = await _service.GetCampaignsAsync(filterDefinition, _ct);

        // Assert
        result.Should().BeEquivalentTo(campaigns);
        await _campaignStorage.Received(1).GetManyAsync(filterDefinition, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignByIdAsync_CallsStorage() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var campaign = new Campaign { Id = campaignId, Name = "Test Campaign" };
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.GetCampaignByIdAsync(campaignId, _ct);

        // Assert
        result.Should().BeEquivalentTo(campaign);
        await _campaignStorage.Received(1).GetByIdAsync(campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateCampaignAsync_CreatesNewCampaign() {
        // Arrange
        var request = new CreateCampaignData {
            Name = "New Campaign",
            Description = "Campaign description",
            IsPublished = false,
            IsPublic = false,
            WorldId = Guid.CreateVersion7(),
        };

        // Act
        var result = await _service.CreateCampaignAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name);
        result.Value.Description.Should().Be(request.Description);
        result.Value.IsPublished.Should().BeFalse();
        result.Value.IsPublic.Should().BeFalse();
        result.Value.Background.Should().BeNull();
        result.Value.Id.Should().NotBe(Guid.Empty);
        result.Value.Adventures.Should().BeEmpty();
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.World!.Id.Should().Be(request.WorldId.Value);
        await _campaignStorage.Received(1).AddAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateCampaignAsync_WithBackgroundId_CreatesCampaignWithBackground() {
        // Arrange
        var backgroundId = Guid.CreateVersion7();
        var background = new Resource {
            Id = backgroundId,
            Type = ResourceType.Image,
            Path = "test/background.jpg",
            Metadata = new ResourceMetadata {
                FileName = "background.jpg",
                ContentType = "image/jpeg",
            },
        };
        var request = new CreateCampaignData {
            Name = "New Campaign",
            Description = "Campaign description",
            BackgroundId = backgroundId,
            IsPublished = false,
            IsPublic = false,
        };

        _mediaStorage.GetByIdAsync(backgroundId, Arg.Any<CancellationToken>()).Returns(background);

        // Act
        var result = await _service.CreateCampaignAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Background.Should().NotBeNull();
        result.Value.Background.Should().BeEquivalentTo(background);
        await _mediaStorage.Received(1).GetByIdAsync(backgroundId, Arg.Any<CancellationToken>());
        await _campaignStorage.Received(1).AddAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateCampaignAsync_WithEmptyName_ReturnsFailure() {
        // Arrange
        var request = new CreateCampaignData {
            Name = "",
            Description = "Campaign description",
        };

        // Act
        var result = await _service.CreateCampaignAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().AddAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateCampaignAsync_WithWhitespaceName_ReturnsFailure() {
        // Arrange
        var request = new CreateCampaignData {
            Name = "   ",
            Description = "Campaign description",
        };

        // Act
        var result = await _service.CreateCampaignAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().AddAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateCampaignAsync_WithNullName_ReturnsFailure() {
        // Arrange
        var request = new CreateCampaignData {
            Name = null!,
            Description = "Campaign description",
        };

        // Act
        var result = await _service.CreateCampaignAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().AddAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneCampaignAsync_WithOwner_ClonesCampaign() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            World = new() { Id = Guid.CreateVersion7() },
            Name = "Campaign",
            OwnerId = _userId,
            Description = "Campaign description",
            IsPublished = false,
            IsPublic = false,
            Background = new Resource {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Image,
                Path = "campaigns/background.jpg",
                Metadata = new ResourceMetadata {
                    ContentType = "image/jpeg",
                    ImageSize = new Size(1920, 1080),
                },
            },
        };
        var allCampaigns = new Campaign[] { campaign };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);
        _campaignStorage.GetManyAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(allCampaigns);

        // Act
        var result = await _service.CloneCampaignAsync(_userId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().NotBe(campaign.Name);
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.World.Should().BeEquivalentTo(campaign.World);
        await _campaignStorage.Received(1).AddAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneCampaignAsync_WithNonOwnerPublicCampaign_ClonesCampaign() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            World = new() { Id = Guid.CreateVersion7() },
            Name = "Campaign",
            OwnerId = _userId,
            Description = "Campaign description",
            IsPublished = true,
            IsPublic = true,
        };
        var allCampaigns = Array.Empty<Campaign>();

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);
        _campaignStorage.GetManyAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(allCampaigns);

        // Act
        var result = await _service.CloneCampaignAsync(nonOwnerId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.OwnerId.Should().Be(nonOwnerId);
        result.Value.World.Should().BeEquivalentTo(campaign.World);
        await _campaignStorage.Received(1).AddAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneCampaignAsync_WithNonOwnerPrivateCampaign_ReturnsNotAllowed() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Description = "Campaign description",
            IsPublished = false,
            IsPublic = false,
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.CloneCampaignAsync(nonOwnerId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().AddAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneCampaignAsync_WithNonExistentCampaign_ReturnsNotFound() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns((Campaign?)null);

        // Act
        var result = await _service.CloneCampaignAsync(_userId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().AddAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneCampaignAsync_WithNamingConflict_RenamesOriginalAndClone() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Description = "Campaign description",
            IsPublished = false,
            IsPublic = false,
        };
        var existingCampaign = new Campaign {
            Id = Guid.CreateVersion7(),
            Name = "Campaign (Copy)",
            OwnerId = _userId,
        };
        var allCampaigns = new Campaign[] { campaign, existingCampaign };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);
        _campaignStorage.GetManyAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(allCampaigns);

        // Act
        var result = await _service.CloneCampaignAsync(_userId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _campaignStorage.Received(1).UpdateAsync(Arg.Is<Campaign>(c => c.Name != "Campaign"), Arg.Any<CancellationToken>());
        await _campaignStorage.Received(1).AddAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateCampaignAsync_WithOwner_UpdatesCampaign() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Old Name",
            OwnerId = _userId,
            Description = "Old description",
            Background = new Resource {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Image,
                Path = "test/background",
                Metadata = new ResourceMetadata {
                    FileName = "background.png",
                    ContentType = "image/png",
                },
            },
        };
        var request = new UpdatedCampaignData {
            Name = "Updated Name",
            Description = "Updated description",
            IsPublished = true,
            IsPublic = true,
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.UpdateCampaignAsync(_userId, campaignId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name.Value);
        result.Value.Description.Should().Be(request.Description.Value);
        result.Value.IsPublished.Should().BeTrue();
        result.Value.IsPublic.Should().BeTrue();
        result.Value.Background.Should().NotBeNull();
        result.Value.Id.Should().Be(campaignId);
        result.Value.OwnerId.Should().Be(_userId);
        await _campaignStorage.Received(1).UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateCampaignAsync_WithOnlyNameUpdate_OnlyUpdatesName() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Old Name",
            OwnerId = _userId,
            Description = "Old description",
            Background = new() {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Image,
                Path = "test/campaign-background.jpg",
                Metadata = new ResourceMetadata {
                    ContentType = "image/jpeg",
                    ImageSize = new Size(1920, 1080),
                },
            },
        };
        var request = new UpdatedCampaignData {
            Name = "Updated Name",
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.UpdateCampaignAsync(_userId, campaignId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name.Value);
        result.Value.Description.Should().Be(campaign.Description);
        result.Value.Background.Should().NotBeNull();
        result.Value.IsPublished.Should().BeFalse();
        result.Value.IsPublic.Should().BeFalse();
        result.Value.Id.Should().Be(campaignId);
        result.Value.OwnerId.Should().Be(_userId);
        await _campaignStorage.Received(1).UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateCampaignAsync_WithBackgroundUpdate_UpdatesBackground() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var newBackgroundId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Description = "Campaign description",
            Background = null,
        };
        var newBackground = new Resource {
            Id = newBackgroundId,
            Type = ResourceType.Image,
            Path = "test/new-background.jpg",
            Metadata = new ResourceMetadata {
                ContentType = "image/jpeg",
            },
        };
        var request = new UpdatedCampaignData {
            BackgroundId = newBackgroundId,
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);
        _mediaStorage.GetByIdAsync(newBackgroundId, Arg.Any<CancellationToken>()).Returns(newBackground);

        // Act
        var result = await _service.UpdateCampaignAsync(_userId, campaignId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Background.Should().NotBeNull();
        result.Value.Background.Should().BeEquivalentTo(newBackground);
        await _mediaStorage.Received(1).GetByIdAsync(newBackgroundId, Arg.Any<CancellationToken>());
        await _campaignStorage.Received(1).UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateCampaignAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
        };
        var request = new UpdatedCampaignData {
            Name = "Updated Name",
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.UpdateCampaignAsync(nonOwnerId, campaignId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateCampaignAsync_WithNonExistentCampaign_ReturnsNotFound() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var request = new UpdatedCampaignData {
            Name = "Updated Name",
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns((Campaign?)null);

        // Act
        var result = await _service.UpdateCampaignAsync(_userId, campaignId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteCampaignAsync_WithOwner_DeletesCampaign() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.DeleteCampaignAsync(_userId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _campaignStorage.Received(1).DeleteAsync(campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteCampaignAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.DeleteCampaignAsync(nonOwnerId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteCampaignAsync_WithNonExistentCampaign_ReturnsNotFound() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns((Campaign?)null);

        // Act
        var result = await _service.DeleteCampaignAsync(_userId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAdventuresAsync_ReturnsAdventures() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Adventures = [
                new() { Id = Guid.CreateVersion7(), Name = "Adventure 1" },
                new() { Id = Guid.CreateVersion7(), Name = "Adventure 2" },
            ],
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.GetAdventuresAsync(campaignId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(campaign.Adventures);
        await _campaignStorage.Received(1).GetByIdAsync(campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAdventuresAsync_WithNonExistentCampaign_ReturnsEmpty() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns((Campaign?)null);

        // Act
        var result = await _service.GetAdventuresAsync(campaignId, _ct);

        // Assert
        result.Should().BeEmpty();
        await _campaignStorage.Received(1).GetByIdAsync(campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewAdventureAsync_WithOwner_AddsAdventure() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Adventures = [],
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.AddNewAdventureAsync(_userId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.Campaign.Should().BeEquivalentTo(campaign);
        await _campaignStorage.Received(1).UpdateAsync(Arg.Is<Campaign>(c => c.Adventures.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewAdventureAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Adventures = [],
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.AddNewAdventureAsync(nonOwnerId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewAdventureAsync_WithNonExistentCampaign_ReturnsNotFound() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns((Campaign?)null);

        // Act
        var result = await _service.AddNewAdventureAsync(_userId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedAdventureAsync_WithOwner_AddsAdventure() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Adventures = [],
        };
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Description = "Adventure description",
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);
        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.AddClonedAdventureAsync(_userId, campaignId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.Campaign.Should().BeEquivalentTo(campaign);
        result.Value.Name.Should().NotBe(adventure.Name);
        await _campaignStorage.Received(1).UpdateAsync(Arg.Is<Campaign>(c => c.Adventures.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedAdventureAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Adventures = [],
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.AddClonedAdventureAsync(nonOwnerId, campaignId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedAdventureAsync_WithNonExistentCampaign_ReturnsNotFound() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns((Campaign?)null);

        // Act
        var result = await _service.AddClonedAdventureAsync(_userId, campaignId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedAdventureAsync_WithNonExistentAdventure_ReturnsNotFound() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Adventures = [],
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);
        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns((Adventure?)null);

        // Act
        var result = await _service.AddClonedAdventureAsync(_userId, campaignId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedAdventureAsync_WithNamingConflict_RenamesOriginalAndClone() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Adventures = [
                new() { Id = Guid.CreateVersion7(), Name = "Adventure (Copy)" },
            ],
        };
        var adventure = new Adventure {
            Id = adventureId,
            Name = "Adventure",
            OwnerId = _userId,
            Description = "Adventure description",
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);
        _adventureStorage.GetByIdAsync(adventureId, Arg.Any<CancellationToken>()).Returns(adventure);

        // Act
        var result = await _service.AddClonedAdventureAsync(_userId, campaignId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _adventureStorage.Received(1).UpdateAsync(Arg.Is<Adventure>(a => a.Name != "Adventure"), Arg.Any<CancellationToken>());
        await _campaignStorage.Received(1).UpdateAsync(Arg.Is<Campaign>(c => c.Adventures.Count == 2), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAdventureAsync_WithOwner_RemovesAdventure() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Adventures = [
                new() { Id = adventureId, Name = "Adventure" },
            ],
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.RemoveAdventureAsync(_userId, campaignId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _campaignStorage.Received(1).UpdateAsync(Arg.Is<Campaign>(c => c.Adventures.Count == 0), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAdventureAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Adventures = [
                new() { Id = adventureId, Name = "Adventure" },
            ],
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.RemoveAdventureAsync(nonOwnerId, campaignId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAdventureAsync_WithNonExistentCampaign_ReturnsNotFound() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns((Campaign?)null);

        // Act
        var result = await _service.RemoveAdventureAsync(_userId, campaignId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAdventureAsync_WithNonExistentAdventure_ReturnsNotFound() {
        // Arrange
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Adventures = [],
        };

        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.RemoveAdventureAsync(_userId, campaignId, adventureId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _campaignStorage.DidNotReceive().UpdateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>());
    }
}
