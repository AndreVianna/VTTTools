using CampaignResourceEntity = VttTools.Data.Library.Entities.CampaignResource;
using ResourceRole = VttTools.Media.Model.ResourceRole;

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
            Path = "campaigns/bg1.jpg",
            FileName = "bg1.jpg",
            ContentType = "image/jpeg",
            FileSize = 2000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };
        var backgroundResource2 = new Media.Entities.Resource {
            Id = Guid.CreateVersion7(),
            Path = "campaigns/bg2.jpg",
            FileName = "bg2.jpg",
            ContentType = "image/jpeg",
            FileSize = 2000,
            Dimensions = new(1920, 1080),
            Duration = TimeSpan.Zero,
        };
        _context.Resources.AddRange(backgroundResource1, backgroundResource2);

        var campaign1Id = Guid.CreateVersion7();
        var campaign2Id = Guid.CreateVersion7();
        var campaign3Id = Guid.CreateVersion7();
        var campaign4Id = Guid.CreateVersion7();

        var campaigns = new[] {
            new Entities.Campaign {
                Id = campaign1Id,
                Name = "My Campaign",
                Description = "My personal campaign",
                IsPublished = true,
                IsPublic = false,
                OwnerId = _currentUserId,
                Resources = [
                    new CampaignResourceEntity {
                        CampaignId = campaign1Id,
                        ResourceId = backgroundResource1.Id,
                        Resource = backgroundResource1,
                        Role = ResourceRole.Background,
                        Index = 0
                    }
                ]
            },
            new Entities.Campaign {
                Id = campaign2Id,
                Name = "Public Campaign",
                Description = "Public campaign for all",
                IsPublished = true,
                IsPublic = true,
                OwnerId = _otherUserId,
                Resources = [
                    new CampaignResourceEntity {
                        CampaignId = campaign2Id,
                        ResourceId = backgroundResource2.Id,
                        Resource = backgroundResource2,
                        Role = ResourceRole.Background,
                        Index = 0
                    }
                ]
            },
            new Entities.Campaign {
                Id = campaign3Id,
                Name = "Draft Campaign",
                Description = "Unpublished campaign",
                IsPublished = false,
                IsPublic = false,
                OwnerId = _currentUserId,
            },
            new Entities.Campaign {
                Id = campaign4Id,
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
                Path = "test/background.jpg",
                FileName = "background.jpg",
                ContentType = "image/jpeg",
                FileSize = 2000,
                Dimensions = new(1920, 1080),
                Duration = TimeSpan.Zero,
            },
            Adventures = [],
        };

        await _storage.AddAsync(campaign, _ct);

        var dbCampaign = await _context.Campaigns.Include(c => c.Resources).FirstAsync(c => c.Id == campaign.Id, _ct);
        dbCampaign.Should().NotBeNull();
        dbCampaign.Resources.Should().HaveCount(1);
        var backgroundResource = dbCampaign.Resources.FirstOrDefault(r => r.Role == ResourceRole.Background);
        backgroundResource.Should().NotBeNull();
        backgroundResource!.ResourceId.Should().Be(backgroundId);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingCampaign_UpdatesInDatabase() {
        _context.ChangeTracker.Clear();
        var entity = await _context.Campaigns.AsNoTracking().FirstAsync(_ct);
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
        _context.ChangeTracker.Clear();
        var dbCampaign = await _context.Campaigns.AsNoTracking().FirstOrDefaultAsync(c => c.Id == campaign.Id, _ct);
        dbCampaign.Should().NotBeNull();
        dbCampaign!.Name.Should().Be("Updated Campaign");
        dbCampaign.Description.Should().Be("Updated description");
        dbCampaign.IsPublished.Should().BeTrue();
        dbCampaign.IsPublic.Should().BeTrue();
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
