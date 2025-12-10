namespace VttTools.Data.Library;

public class CampaignStorageTests
    : IDisposable {
    private readonly CampaignStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly Guid _currentUserId = Guid.CreateVersion7();
    private readonly Guid _otherUserId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public CampaignStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(_currentUserId);
        _storage = new(_context);
        _ct = TestContext.Current.CancellationToken;
        SeedCampaigns();
    }

    public void Dispose() {
        DbContextHelper.Dispose(_context);
        GC.SuppressFinalize(this);
    }

    private void SeedCampaigns() {
        var backgroundResource1 = new Media.Entities.Resource {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Background,
            Path = "campaigns/bg1.jpg",
            FileName = "bg1.jpg",
            ContentType = "image/jpeg",
            FileLength = 2000,
            Size = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };
        var backgroundResource2 = new Media.Entities.Resource {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Background,
            Path = "campaigns/bg2.jpg",
            FileName = "bg2.jpg",
            ContentType = "image/jpeg",
            FileLength = 2000,
            Size = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };
        _context.Resources.AddRange(backgroundResource1, backgroundResource2);

        var campaigns = new[] {
            new Entities.Campaign {
                Id = Guid.CreateVersion7(),
                Name = "My Campaign",
                Description = "My personal campaign",
                IsPublished = true,
                IsPublic = false,
                OwnerId = _currentUserId,
                BackgroundId = backgroundResource1.Id,
            },
            new Entities.Campaign {
                Id = Guid.CreateVersion7(),
                Name = "Public Campaign",
                Description = "Public campaign for all",
                IsPublished = true,
                IsPublic = true,
                OwnerId = _otherUserId,
                BackgroundId = backgroundResource2.Id,
            },
            new Entities.Campaign {
                Id = Guid.CreateVersion7(),
                Name = "Draft Campaign",
                Description = "Unpublished campaign",
                IsPublished = false,
                IsPublic = false,
                OwnerId = _currentUserId,
            },
            new Entities.Campaign {
                Id = Guid.CreateVersion7(),
                Name = "Other User Campaign",
                Description = "Private campaign by other user",
                IsPublished = true,
                IsPublic = false,
                OwnerId = _otherUserId,
            },
        };
        _context.Campaigns.AddRange(campaigns);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllCampaigns() {
        var result = await _storage.GetAllAsync(_ct);

        result.Should().HaveCount(4);
        result.Should().Contain(c => c.Name == "My Campaign");
        result.Should().Contain(c => c.Name == "Public Campaign");
        result.Should().Contain(c => c.Name == "Draft Campaign");
        result.Should().Contain(c => c.Name == "Other User Campaign");
    }

    [Fact]
    public async Task GetManyAsync_WithOwnedByFilter_ReturnsOwnedCampaigns() {
        var result = await _storage.GetManyAsync($"OwnedBy:{_currentUserId}", _ct);

        result.Should().HaveCount(2);
        result.Should().Contain(c => c.Name == "My Campaign");
        result.Should().Contain(c => c.Name == "Draft Campaign");
        result.Should().OnlyContain(c => c.OwnerId == _currentUserId);
    }

    [Fact]
    public async Task GetManyAsync_WithAvailableToFilter_ReturnsAccessibleCampaigns() {
        var result = await _storage.GetManyAsync($"AvailableTo:{_currentUserId}", _ct);

        result.Should().HaveCount(3);
        result.Should().Contain(c => c.Name == "My Campaign");
        result.Should().Contain(c => c.Name == "Public Campaign");
        result.Should().Contain(c => c.Name == "Draft Campaign");
        result.Should().NotContain(c => c.Name == "Other User Campaign");
    }

    [Fact]
    public async Task GetManyAsync_WithPublicFilter_ReturnsPublicCampaigns() {
        var result = await _storage.GetManyAsync("Public", _ct);

        result.Should().HaveCount(1);
        result.Should().Contain(c => c.Name == "Public Campaign");
        result.Should().OnlyContain(c => c.IsPublic && c.IsPublished);
    }

    [Fact]
    public async Task GetManyAsync_WithInvalidFilter_ReturnsAllCampaigns() {
        var result = await _storage.GetManyAsync("InvalidFilter", _ct);

        result.Should().HaveCount(4);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsCampaign() {
        var entity = await _context.Campaigns.FirstAsync(_ct);

        var result = await _storage.GetByIdAsync(entity.Id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
        result.Name.Should().Be(entity.Name);
        result.Description.Should().Be(entity.Description);
        result.IsPublished.Should().Be(entity.IsPublished);
        result.IsPublic.Should().Be(entity.IsPublic);
        result.OwnerId.Should().Be(entity.OwnerId);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull() {
        var nonExistingId = Guid.CreateVersion7();

        var result = await _storage.GetByIdAsync(nonExistingId, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_IncludesBackground_WhenCampaignHasBackground() {
        var entity = await _context.Campaigns
            .FirstAsync(c => c.BackgroundId != null, _ct);

        var result = await _storage.GetByIdAsync(entity.Id, _ct);

        result.Should().NotBeNull();
        result.Background.Should().NotBeNull();
        result.Background!.Id.Should().Be(entity.BackgroundId!.Value);
    }

    [Fact]
    public async Task AddAsync_WithValidCampaign_AddsToDatabase() {
        var campaign = new Campaign {
            Id = Guid.CreateVersion7(),
            Name = "New Campaign",
            Description = "A new campaign",
            IsPublished = false,
            IsPublic = false,
            OwnerId = _currentUserId,
            Adventures = [],
        };

        await _storage.AddAsync(campaign, _ct);

        var dbCampaign = await _context.Campaigns.FindAsync([campaign.Id], _ct);
        dbCampaign.Should().NotBeNull();
        dbCampaign.Id.Should().Be(campaign.Id);
        dbCampaign.Name.Should().Be(campaign.Name);
        dbCampaign.Description.Should().Be(campaign.Description);
        dbCampaign.IsPublished.Should().Be(campaign.IsPublished);
        dbCampaign.IsPublic.Should().Be(campaign.IsPublic);
        dbCampaign.OwnerId.Should().Be(campaign.OwnerId);
    }

    [Fact]
    public async Task AddAsync_WithBackground_SavesBackgroundReference() {
        var backgroundId = Guid.CreateVersion7();
        var campaign = new Campaign {
            Id = Guid.CreateVersion7(),
            Name = "Campaign with Background",
            Description = "Test campaign",
            IsPublished = false,
            IsPublic = false,
            OwnerId = _currentUserId,
            Background = new ResourceMetadata {
                Id = backgroundId,
                ResourceType = ResourceType.Background,
                Path = "test/background.jpg",
                FileName = "background.jpg",
                ContentType = "image/jpeg",
                FileLength = 2000,
                Size = new(1920, 1080),
                Duration = TimeSpan.Zero,
            },
            Adventures = [],
        };

        await _storage.AddAsync(campaign, _ct);

        var dbCampaign = await _context.Campaigns.FindAsync([campaign.Id], _ct);
        dbCampaign.Should().NotBeNull();
        dbCampaign.BackgroundId.Should().Be(backgroundId);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingCampaign_UpdatesInDatabase() {
        var entity = await _context.Campaigns.FirstAsync(_ct);
        var campaign = new Campaign {
            Id = entity.Id,
            Name = "Updated Campaign",
            Description = "Updated description",
            IsPublished = true,
            IsPublic = true,
            OwnerId = entity.OwnerId,
            Adventures = [],
        };

        var result = await _storage.UpdateAsync(campaign, _ct);

        result.Should().BeTrue();
        var dbCampaign = await _context.Campaigns.FindAsync([campaign.Id], _ct);
        dbCampaign.Should().NotBeNull();
        dbCampaign.Name.Should().Be("Updated Campaign");
        dbCampaign.Description.Should().Be("Updated description");
        dbCampaign.IsPublished.Should().BeTrue();
        dbCampaign.IsPublic.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistingCampaign_ReturnsFalse() {
        var campaign = new Campaign {
            Id = Guid.CreateVersion7(),
            Name = "Non-existing Campaign",
            Description = "Test",
            IsPublished = false,
            IsPublic = false,
            OwnerId = _currentUserId,
            Adventures = [],
        };

        var result = await _storage.UpdateAsync(campaign, _ct);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_WithExistingCampaign_RemovesFromDatabase() {
        var entity = await _context.Campaigns.FirstAsync(_ct);

        var result = await _storage.DeleteAsync(entity.Id, _ct);

        result.Should().BeTrue();
        var dbCampaign = await _context.Campaigns.FindAsync([entity.Id], _ct);
        dbCampaign.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingCampaign_ReturnsFalse() {
        var nonExistingId = Guid.CreateVersion7();

        var result = await _storage.DeleteAsync(nonExistingId, _ct);

        result.Should().BeFalse();
    }
}
