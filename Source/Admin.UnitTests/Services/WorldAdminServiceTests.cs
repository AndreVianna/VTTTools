namespace VttTools.Admin.UnitTests.Services;

public sealed class WorldAdminServiceTests : IAsyncLifetime {
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly ApplicationDbContext _mockDbContext;
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<WorldAdminService> _mockLogger;
    private readonly WorldAdminService _sut;
    private readonly Guid _masterUserId = Guid.CreateVersion7();

    public WorldAdminServiceTests() {
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockOptions.Value.Returns(new PublicLibraryOptions { MasterUserId = _masterUserId });

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"TestDb_{Guid.CreateVersion7()}")
            .Options;
        _mockDbContext = new ApplicationDbContext(options);

        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<WorldAdminService>>();
        _sut = new WorldAdminService(_mockOptions, _mockDbContext, _mockUserManager, _mockLogger);
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() {
        await _mockDbContext.DisposeAsync();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task SearchWorldsAsync_WithValidRequest_ReturnsPagedResults() {
        var worlds = CreateTestWorlds(15);
        await _mockDbContext.Worlds.AddRangeAsync(worlds, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };

        var result = await _sut.SearchWorldsAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(10);
        result.TotalCount.Should().Be(15);
        result.HasMore.Should().BeTrue();
    }

    [Fact]
    public async Task SearchWorldsAsync_WithSearchTerm_ReturnsFilteredResults() {
        var worlds = new List<World> {
            CreateTestWorld("Forgotten Realms", "D&D world"),
            CreateTestWorld("Eberron", "Another D&D world"),
            CreateTestWorld("Middle Earth", "Tolkien's world")
        };
        await _mockDbContext.Worlds.AddRangeAsync(worlds, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Search = "D&D", Skip = 0, Take = 10 };

        var result = await _sut.SearchWorldsAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(2);
    }

    [Fact]
    public async Task GetWorldByIdAsync_WithExistingWorld_ReturnsWorld() {
        var world = CreateTestWorld("Test World", "Test description");
        await _mockDbContext.Worlds.AddAsync(world, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetWorldByIdAsync(world.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result!.Id.Should().Be(world.Id);
        result.Name.Should().Be("Test World");
    }

    [Fact]
    public async Task GetWorldByIdAsync_WithNonExistentWorld_ReturnsNull() {
        var result = await _sut.GetWorldByIdAsync(Guid.CreateVersion7(), TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateWorldAsync_WithValidData_CreatesWorld() {
        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CreateWorldAsync("New World", "Description", TestContext.Current.CancellationToken);

        result.Name.Should().Be("New World");
        result.IsPublished.Should().BeFalse();
        result.OwnerId.Should().Be(_masterUserId);

        var saved = await _mockDbContext.Worlds.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateWorldAsync_WithEmptyName_ThrowsArgumentException() {
        var act = () => _sut.CreateWorldAsync("", "Description", default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task UpdateWorldAsync_WithValidData_UpdatesWorld() {
        var world = CreateTestWorld("Old Name", "Old description");
        await _mockDbContext.Worlds.AddAsync(world, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.UpdateWorldAsync(world.Id, "New Name", "New desc", true, true, TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Name");
        result.IsPublished.Should().BeTrue();
        result.IsPublic.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateWorldAsync_WithNonExistentWorld_ThrowsInvalidOperationException() {
        var act = () => _sut.UpdateWorldAsync(Guid.CreateVersion7(), "Name", "Desc", null, null, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task DeleteWorldAsync_WithExistingWorld_DeletesWorld() {
        var world = CreateTestWorld("To Delete", "Description");
        await _mockDbContext.Worlds.AddAsync(world, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        await _sut.DeleteWorldAsync(world.Id, TestContext.Current.CancellationToken);

        var deleted = await _mockDbContext.Worlds.FindAsync([world.Id], TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteWorldAsync_WithNonExistentWorld_DoesNotThrow() {
        var act = () => _sut.DeleteWorldAsync(Guid.CreateVersion7(), default);

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task TransferWorldOwnershipAsync_WithTakeAction_TransfersToMaster() {
        var world = CreateTestWorld("Test", "Desc", Guid.CreateVersion7());
        await _mockDbContext.Worlds.AddAsync(world, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new TransferOwnershipRequest { Action = "take" };

        await _sut.TransferWorldOwnershipAsync(world.Id, request, TestContext.Current.CancellationToken);

        var updated = await _mockDbContext.Worlds.FindAsync([world.Id], TestContext.Current.CancellationToken);
        updated!.OwnerId.Should().Be(_masterUserId);
    }

    [Fact]
    public async Task TransferWorldOwnershipAsync_WithGrantAction_TransfersToTarget() {
        var targetUserId = Guid.CreateVersion7();
        var world = CreateTestWorld("Test", "Desc", _masterUserId);
        await _mockDbContext.Worlds.AddAsync(world, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new TransferOwnershipRequest { Action = "grant", TargetUserId = targetUserId };

        await _sut.TransferWorldOwnershipAsync(world.Id, request, TestContext.Current.CancellationToken);

        var updated = await _mockDbContext.Worlds.FindAsync([world.Id], TestContext.Current.CancellationToken);
        updated!.OwnerId.Should().Be(targetUserId);
    }

    [Fact]
    public async Task GetCampaignsByWorldIdAsync_WithCampaigns_ReturnsCampaigns() {
        var world = CreateTestWorld("World", "Desc");
        await _mockDbContext.Worlds.AddAsync(world, TestContext.Current.CancellationToken);

        var campaigns = new List<Campaign> {
            CreateTestCampaign("Campaign 1", "Desc 1", world.Id),
            CreateTestCampaign("Campaign 2", "Desc 2", world.Id)
        };
        await _mockDbContext.Campaigns.AddRangeAsync(campaigns, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetCampaignsByWorldIdAsync(world.Id, TestContext.Current.CancellationToken);

        result.Count.Should().Be(2);
    }

    [Fact]
    public async Task CreateCampaignForWorldAsync_WithValidData_CreatesCampaign() {
        var world = CreateTestWorld("World", "Desc");
        await _mockDbContext.Worlds.AddAsync(world, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CreateCampaignForWorldAsync(world.Id, "New Campaign", "Desc", TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Campaign");

        var saved = await _mockDbContext.Campaigns.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
        saved!.WorldId.Should().Be(world.Id);
    }

    [Fact]
    public async Task CloneCampaignAsync_WithValidData_ClonesCampaign() {
        var world = CreateTestWorld("World", "Desc");
        await _mockDbContext.Worlds.AddAsync(world, TestContext.Current.CancellationToken);

        var campaign = CreateTestCampaign("Original", "Original desc", world.Id);
        await _mockDbContext.Campaigns.AddAsync(campaign, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CloneCampaignAsync(world.Id, campaign.Id, "Cloned", TestContext.Current.CancellationToken);

        result.Name.Should().Be("Cloned");

        var campaigns = await _mockDbContext.Campaigns.ToListAsync(TestContext.Current.CancellationToken);
        campaigns.Count.Should().Be(2);
    }

    [Fact]
    public async Task RemoveCampaignFromWorldAsync_WithValidData_RemovesCampaign() {
        var world = CreateTestWorld("World", "Desc");
        await _mockDbContext.Worlds.AddAsync(world, TestContext.Current.CancellationToken);

        var campaign = CreateTestCampaign("Campaign", "Desc", world.Id);
        await _mockDbContext.Campaigns.AddAsync(campaign, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        await _sut.RemoveCampaignFromWorldAsync(world.Id, campaign.Id, TestContext.Current.CancellationToken);

        var deleted = await _mockDbContext.Campaigns.FindAsync([campaign.Id], TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private World CreateTestWorld(string name, string description, Guid? ownerId = null) => new() {
        Id = Guid.CreateVersion7(),
        OwnerId = ownerId ?? _masterUserId,
        Name = name,
        Description = description,
        IsPublished = false,
        IsPublic = false
    };

    private List<World> CreateTestWorlds(int count) {
        var worlds = new List<World>();
        for (var i = 0; i < count; i++) {
            worlds.Add(CreateTestWorld($"World {i}", $"Description {i}"));
        }
        return worlds;
    }

    private Campaign CreateTestCampaign(string name, string description, Guid worldId) => new() {
        Id = Guid.CreateVersion7(),
        WorldId = worldId,
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
