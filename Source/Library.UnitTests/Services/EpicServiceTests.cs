namespace VttTools.Library.Services;

public class EpicServiceTests {
    private readonly IEpicStorage _epicStorage;
    private readonly ICampaignStorage _campaignStorage;
    private readonly IMediaStorage _mediaStorage;
    private readonly EpicService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public EpicServiceTests() {
        _epicStorage = Substitute.For<IEpicStorage>();
        _campaignStorage = Substitute.For<ICampaignStorage>();
        _mediaStorage = Substitute.For<IMediaStorage>();
        _service = new(_epicStorage, _campaignStorage, _mediaStorage);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GetEpicsAsync_CallsStorage() {
        // Arrange
        var epics = new Epic[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test Epic 1" },
            new() { Id = Guid.CreateVersion7(), Name = "Test Epic 2" },
        };
        _epicStorage.GetAllAsync(Arg.Any<CancellationToken>()).Returns(epics);

        // Act
        var result = await _service.GetEpicsAsync(_ct);

        // Assert
        result.Should().BeEquivalentTo(epics);
        await _epicStorage.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetEpicsAsync_WithFilter_CallsStorage() {
        // Arrange
        var filterDefinition = "AvailableTo:user-123";
        var epics = new Epic[] {
            new() { Id = Guid.CreateVersion7(), Name = "Test Epic 1" },
        };
        _epicStorage.GetManyAsync(filterDefinition, Arg.Any<CancellationToken>()).Returns(epics);

        // Act
        var result = await _service.GetEpicsAsync(filterDefinition, _ct);

        // Assert
        result.Should().BeEquivalentTo(epics);
        await _epicStorage.Received(1).GetManyAsync(filterDefinition, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetEpicByIdAsync_CallsStorage() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var epic = new Epic { Id = epicId, Name = "Test Epic" };
        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.GetEpicByIdAsync(epicId, _ct);

        // Assert
        result.Should().BeEquivalentTo(epic);
        await _epicStorage.Received(1).GetByIdAsync(epicId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateEpicAsync_CreatesNewEpic() {
        // Arrange
        var request = new CreateEpicData {
            Name = "New Epic",
            Description = "Epic description",
            IsPublished = false,
            IsPublic = false,
        };

        // Act
        var result = await _service.CreateEpicAsync(_userId, request, _ct);

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
        await _epicStorage.Received(1).AddAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateEpicAsync_WithBackgroundId_CreatesEpicWithBackground() {
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
        var request = new CreateEpicData {
            Name = "New Epic",
            Description = "Epic description",
            BackgroundId = backgroundId,
            IsPublished = false,
            IsPublic = false,
        };

        _mediaStorage.GetByIdAsync(backgroundId, Arg.Any<CancellationToken>()).Returns(background);

        // Act
        var result = await _service.CreateEpicAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Background.Should().NotBeNull();
        result.Value.Background.Should().BeEquivalentTo(background);
        await _mediaStorage.Received(1).GetByIdAsync(backgroundId, Arg.Any<CancellationToken>());
        await _epicStorage.Received(1).AddAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateEpicAsync_WithEmptyName_ReturnsFailure() {
        // Arrange
        var request = new CreateEpicData {
            Name = "",
            Description = "Epic description",
        };

        // Act
        var result = await _service.CreateEpicAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().AddAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateEpicAsync_WithWhitespaceName_ReturnsFailure() {
        // Arrange
        var request = new CreateEpicData {
            Name = "   ",
            Description = "Epic description",
        };

        // Act
        var result = await _service.CreateEpicAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().AddAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateEpicAsync_WithNullName_ReturnsFailure() {
        // Arrange
        var request = new CreateEpicData {
            Name = null!,
            Description = "Epic description",
        };

        // Act
        var result = await _service.CreateEpicAsync(_userId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().AddAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneEpicAsync_WithOwner_ClonesEpic() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Description = "Epic description",
            IsPublished = false,
            IsPublic = false,
            Background = new Resource {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Image,
                Path = "epics/background.jpg",
                Metadata = new ResourceMetadata {
                    ContentType = "image/jpeg",
                    ImageSize = new Size(1920, 1080),
                },
            },
        };
        var allEpics = new Epic[] { epic };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);
        _epicStorage.GetManyAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(allEpics);

        // Act
        var result = await _service.CloneEpicAsync(_userId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().NotBe(epic.Name);
        result.Value.OwnerId.Should().Be(_userId);
        await _epicStorage.Received(1).AddAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneEpicAsync_WithNonOwnerPublicEpic_ClonesEpic() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Description = "Epic description",
            IsPublished = true,
            IsPublic = true,
        };
        var allEpics = Array.Empty<Epic>();

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);
        _epicStorage.GetManyAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(allEpics);

        // Act
        var result = await _service.CloneEpicAsync(nonOwnerId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.OwnerId.Should().Be(nonOwnerId);
        await _epicStorage.Received(1).AddAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneEpicAsync_WithNonOwnerPrivateEpic_ReturnsNotAllowed() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Description = "Epic description",
            IsPublished = false,
            IsPublic = false,
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.CloneEpicAsync(nonOwnerId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().AddAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneEpicAsync_WithNonExistentEpic_ReturnsNotFound() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns((Epic?)null);

        // Act
        var result = await _service.CloneEpicAsync(_userId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().AddAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneEpicAsync_WithNamingConflict_RenamesOriginalAndClone() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Description = "Epic description",
            IsPublished = false,
            IsPublic = false,
        };
        var existingEpic = new Epic {
            Id = Guid.CreateVersion7(),
            Name = "Epic (Copy)",
            OwnerId = _userId,
        };
        var allEpics = new Epic[] { epic, existingEpic };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);
        _epicStorage.GetManyAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(allEpics);

        // Act
        var result = await _service.CloneEpicAsync(_userId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _epicStorage.Received(1).UpdateAsync(Arg.Is<Epic>(e => e.Name != "Epic"), Arg.Any<CancellationToken>());
        await _epicStorage.Received(1).AddAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEpicAsync_WithOwner_UpdatesEpic() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
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
        var request = new UpdatedEpicData {
            Name = "Updated Name",
            Description = "Updated description",
            IsPublished = true,
            IsPublic = true,
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.UpdateEpicAsync(_userId, epicId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name.Value);
        result.Value.Description.Should().Be(request.Description.Value);
        result.Value.IsPublished.Should().BeTrue();
        result.Value.IsPublic.Should().BeTrue();
        result.Value.Background.Should().NotBeNull();
        result.Value.Id.Should().Be(epicId);
        result.Value.OwnerId.Should().Be(_userId);
        await _epicStorage.Received(1).UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEpicAsync_WithOnlyNameUpdate_OnlyUpdatesName() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Old Name",
            OwnerId = _userId,
            Description = "Old description",
            Background = new() {
                Id = Guid.CreateVersion7(),
                Type = ResourceType.Image,
                Path = "test/epic-background.jpg",
                Metadata = new ResourceMetadata {
                    ContentType = "image/jpeg",
                    ImageSize = new Size(1920, 1080),
                },
            },
        };
        var request = new UpdatedEpicData {
            Name = "Updated Name",
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.UpdateEpicAsync(_userId, epicId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(request.Name.Value);
        result.Value.Description.Should().Be(epic.Description);
        result.Value.Background.Should().NotBeNull();
        result.Value.IsPublished.Should().BeFalse();
        result.Value.IsPublic.Should().BeFalse();
        result.Value.Id.Should().Be(epicId);
        result.Value.OwnerId.Should().Be(_userId);
        await _epicStorage.Received(1).UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEpicAsync_WithBackgroundUpdate_UpdatesBackground() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var newBackgroundId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Description = "Epic description",
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
        var request = new UpdatedEpicData {
            BackgroundId = newBackgroundId,
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);
        _mediaStorage.GetByIdAsync(newBackgroundId, Arg.Any<CancellationToken>()).Returns(newBackground);

        // Act
        var result = await _service.UpdateEpicAsync(_userId, epicId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Background.Should().NotBeNull();
        result.Value.Background.Should().BeEquivalentTo(newBackground);
        await _mediaStorage.Received(1).GetByIdAsync(newBackgroundId, Arg.Any<CancellationToken>());
        await _epicStorage.Received(1).UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEpicAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
        };
        var request = new UpdatedEpicData {
            Name = "Updated Name",
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.UpdateEpicAsync(nonOwnerId, epicId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateEpicAsync_WithNonExistentEpic_ReturnsNotFound() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var request = new UpdatedEpicData {
            Name = "Updated Name",
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns((Epic?)null);

        // Act
        var result = await _service.UpdateEpicAsync(_userId, epicId, request, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteEpicAsync_WithOwner_DeletesEpic() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.DeleteEpicAsync(_userId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _epicStorage.Received(1).DeleteAsync(epicId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteEpicAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.DeleteEpicAsync(nonOwnerId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteEpicAsync_WithNonExistentEpic_ReturnsNotFound() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns((Epic?)null);

        // Act
        var result = await _service.DeleteEpicAsync(_userId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignsAsync_ReturnsCampaigns() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Campaigns = [
                new() { Id = Guid.CreateVersion7(), Name = "Campaign 1" },
                new() { Id = Guid.CreateVersion7(), Name = "Campaign 2" },
            ],
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.GetCampaignsAsync(epicId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(epic.Campaigns);
        await _epicStorage.Received(1).GetByIdAsync(epicId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignsAsync_WithNonExistentEpic_ReturnsEmpty() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns((Epic?)null);

        // Act
        var result = await _service.GetCampaignsAsync(epicId, _ct);

        // Assert
        result.Should().BeEmpty();
        await _epicStorage.Received(1).GetByIdAsync(epicId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewCampaignAsync_WithOwner_AddsCampaign() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Campaigns = [],
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.AddNewCampaignAsync(_userId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.EpicId.Should().Be(epicId);
        await _epicStorage.Received(1).UpdateAsync(Arg.Is<Epic>(e => e.Campaigns.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewCampaignAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Campaigns = [],
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.AddNewCampaignAsync(nonOwnerId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddNewCampaignAsync_WithNonExistentEpic_ReturnsNotFound() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns((Epic?)null);

        // Act
        var result = await _service.AddNewCampaignAsync(_userId, epicId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignAsync_WithOwner_AddsCampaign() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Campaigns = [],
        };
        var campaign = new Campaign {
            Id = campaignId,
            Name = "Campaign",
            OwnerId = _userId,
            Description = "Campaign description",
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.AddClonedCampaignAsync(_userId, epicId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.EpicId.Should().Be(epicId);
        result.Value.Name.Should().NotBe(campaign.Name);
        await _epicStorage.Received(1).UpdateAsync(Arg.Is<Epic>(e => e.Campaigns.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Campaigns = [],
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.AddClonedCampaignAsync(nonOwnerId, epicId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignAsync_WithNonExistentEpic_ReturnsNotFound() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns((Epic?)null);

        // Act
        var result = await _service.AddClonedCampaignAsync(_userId, epicId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignAsync_WithNonExistentCampaign_ReturnsNotFound() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Campaigns = [],
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns((Campaign?)null);

        // Act
        var result = await _service.AddClonedCampaignAsync(_userId, epicId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddClonedCampaignAsync_WithNamingConflict_RenamesOriginalAndClone() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
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

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);
        _campaignStorage.GetByIdAsync(campaignId, Arg.Any<CancellationToken>()).Returns(campaign);

        // Act
        var result = await _service.AddClonedCampaignAsync(_userId, epicId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _campaignStorage.Received(1).UpdateAsync(Arg.Is<Campaign>(c => c.Name != "Campaign"), Arg.Any<CancellationToken>());
        await _epicStorage.Received(1).UpdateAsync(Arg.Is<Epic>(e => e.Campaigns.Count == 2), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveCampaignAsync_WithOwner_RemovesCampaign() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Campaigns = [
                new() { Id = campaignId, Name = "Campaign" },
            ],
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.RemoveCampaignAsync(_userId, epicId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _epicStorage.Received(1).UpdateAsync(Arg.Is<Epic>(e => e.Campaigns.Count == 0), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveCampaignAsync_WithNonOwner_ReturnsNotAllowed() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Campaigns = [
                new() { Id = campaignId, Name = "Campaign" },
            ],
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.RemoveCampaignAsync(nonOwnerId, epicId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveCampaignAsync_WithNonExistentEpic_ReturnsNotFound() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns((Epic?)null);

        // Act
        var result = await _service.RemoveCampaignAsync(_userId, epicId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveCampaignAsync_WithNonExistentCampaign_ReturnsNotFound() {
        // Arrange
        var epicId = Guid.CreateVersion7();
        var campaignId = Guid.CreateVersion7();
        var epic = new Epic {
            Id = epicId,
            Name = "Epic",
            OwnerId = _userId,
            Campaigns = [],
        };

        _epicStorage.GetByIdAsync(epicId, Arg.Any<CancellationToken>()).Returns(epic);

        // Act
        var result = await _service.RemoveCampaignAsync(_userId, epicId, campaignId, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        await _epicStorage.DidNotReceive().UpdateAsync(Arg.Any<Epic>(), Arg.Any<CancellationToken>());
    }
}
