namespace VttTools.Admin.UnitTests.Services;

public sealed class CampaignAdminServiceTests : IAsyncLifetime {
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly ApplicationDbContext _mockDbContext;
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<CampaignAdminService> _mockLogger;
    private readonly CampaignAdminService _sut;
    private readonly Guid _masterUserId = Guid.CreateVersion7();

    public CampaignAdminServiceTests() {
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockOptions.Value.Returns(new PublicLibraryOptions { MasterUserId = _masterUserId });

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"TestDb_{Guid.CreateVersion7()}")
            .Options;
        _mockDbContext = new ApplicationDbContext(options);

        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<CampaignAdminService>>();
        _sut = new CampaignAdminService(_mockOptions, _mockDbContext, _mockUserManager, _mockLogger);
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() {
        await _mockDbContext.DisposeAsync();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task SearchCampaignsAsync_WithValidRequest_ReturnsPagedResults() {
        var campaigns = CreateTestCampaigns(15);
        await _mockDbContext.Campaigns.AddRangeAsync(campaigns, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };

        var result = await _sut.SearchCampaignsAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(10);
        result.TotalCount.Should().Be(15);
        result.HasMore.Should().BeTrue();
    }

    [Fact]
    public async Task GetCampaignByIdAsync_WithExistingCampaign_ReturnsCampaign() {
        var campaign = CreateTestCampaign("Test Campaign", "Description");
        await _mockDbContext.Campaigns.AddAsync(campaign, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetCampaignByIdAsync(campaign.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result!.Id.Should().Be(campaign.Id);
    }

    [Fact]
    public async Task CreateCampaignAsync_WithValidData_CreatesCampaign() {
        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CreateCampaignAsync("New Campaign", "Description", TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Campaign");
        result.IsPublished.Should().BeFalse();

        var saved = await _mockDbContext.Campaigns.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateCampaignAsync_WithValidData_UpdatesCampaign() {
        var campaign = CreateTestCampaign("Old Name", "Old description");
        await _mockDbContext.Campaigns.AddAsync(campaign, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.UpdateCampaignAsync(campaign.Id, "New Name", "New desc", true, true, TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Name");
        result.IsPublished.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteCampaignAsync_WithExistingCampaign_DeletesCampaign() {
        var campaign = CreateTestCampaign("To Delete", "Description");
        await _mockDbContext.Campaigns.AddAsync(campaign, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        await _sut.DeleteCampaignAsync(campaign.Id, TestContext.Current.CancellationToken);

        var deleted = await _mockDbContext.Campaigns.FindAsync([campaign.Id], TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task TransferCampaignOwnershipAsync_WithTakeAction_TransfersToMaster() {
        var campaign = CreateTestCampaign("Test", "Desc", Guid.CreateVersion7());
        await _mockDbContext.Campaigns.AddAsync(campaign, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new TransferOwnershipRequest { Action = "take" };

        await _sut.TransferCampaignOwnershipAsync(campaign.Id, request, TestContext.Current.CancellationToken);

        var updated = await _mockDbContext.Campaigns.FindAsync([campaign.Id], TestContext.Current.CancellationToken);
        updated!.OwnerId.Should().Be(_masterUserId);
    }

    [Fact]
    public async Task GetAdventuresByCampaignIdAsync_WithAdventures_ReturnsAdventures() {
        var campaign = CreateTestCampaign("Campaign", "Desc");
        await _mockDbContext.Campaigns.AddAsync(campaign, TestContext.Current.CancellationToken);

        var adventures = new List<Adventure> {
            CreateTestAdventure("Adventure 1", "Desc 1", campaign.Id),
            CreateTestAdventure("Adventure 2", "Desc 2", campaign.Id)
        };
        await _mockDbContext.Adventures.AddRangeAsync(adventures, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetAdventuresByCampaignIdAsync(campaign.Id, TestContext.Current.CancellationToken);

        result.Count.Should().Be(2);
    }

    [Fact]
    public async Task CreateAdventureForCampaignAsync_WithValidData_CreatesAdventure() {
        var campaign = CreateTestCampaign("Campaign", "Desc");
        await _mockDbContext.Campaigns.AddAsync(campaign, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CreateAdventureForCampaignAsync(campaign.Id, "New Adventure", "Desc", TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Adventure");

        var saved = await _mockDbContext.Adventures.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
        saved!.CampaignId.Should().Be(campaign.Id);
    }

    [Fact]
    public async Task CloneAdventureAsync_WithValidData_ClonesAdventure() {
        var campaign = CreateTestCampaign("Campaign", "Desc");
        await _mockDbContext.Campaigns.AddAsync(campaign, TestContext.Current.CancellationToken);

        var adventure = CreateTestAdventure("Original", "Original desc", campaign.Id);
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CloneAdventureAsync(campaign.Id, adventure.Id, "Cloned", TestContext.Current.CancellationToken);

        result.Name.Should().Be("Cloned");

        var adventures = await _mockDbContext.Adventures.ToListAsync(TestContext.Current.CancellationToken);
        adventures.Count.Should().Be(2);
    }

    [Fact]
    public async Task RemoveAdventureFromCampaignAsync_WithValidData_RemovesAdventure() {
        var campaign = CreateTestCampaign("Campaign", "Desc");
        await _mockDbContext.Campaigns.AddAsync(campaign, TestContext.Current.CancellationToken);

        var adventure = CreateTestAdventure("Adventure", "Desc", campaign.Id);
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        await _sut.RemoveAdventureFromCampaignAsync(campaign.Id, adventure.Id, TestContext.Current.CancellationToken);

        var deleted = await _mockDbContext.Adventures.FindAsync([adventure.Id], TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private Campaign CreateTestCampaign(string name, string description, Guid? ownerId = null) => new() {
        Id = Guid.CreateVersion7(),
        OwnerId = ownerId ?? _masterUserId,
        Name = name,
        Description = description,
        IsPublished = false,
        IsPublic = false
    };

    private List<Campaign> CreateTestCampaigns(int count) {
        var campaigns = new List<Campaign>();
        for (var i = 0; i < count; i++) {
            campaigns.Add(CreateTestCampaign($"Campaign {i}", $"Description {i}"));
        }
        return campaigns;
    }

    private Adventure CreateTestAdventure(string name, string description, Guid campaignId) => new() {
        Id = Guid.CreateVersion7(),
        CampaignId = campaignId,
        OwnerId = _masterUserId,
        Name = name,
        Description = description,
        IsPublished = false,
        IsPublic = false
    };

    private static User CreateTestUser(Guid id, string email, string name) => new() {
        Id = id,
        UserName = email,
        Email = email,
        DisplayName = name,
        EmailConfirmed = true
    };

    private static List<User> CreateTestUsers(int count) {
        var users = new List<User>();
        for (var i = 0; i < count; i++) {
            users.Add(CreateTestUser(Guid.CreateVersion7(), $"user{i}@example.com", $"User {i}"));
        }
        return users;
    }
}
