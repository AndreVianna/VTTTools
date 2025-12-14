using AdventureModel = VttTools.Library.Adventures.Model.Adventure;
using CampaignModel = VttTools.Library.Campaigns.Model.Campaign;

namespace VttTools.Admin.UnitTests.Services;

public sealed class CampaignAdminServiceTests : IAsyncLifetime {
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly ICampaignStorage _mockCampaignStorage;
    private readonly IAdventureStorage _mockAdventureStorage;
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<CampaignAdminService> _mockLogger;
    private readonly CampaignAdminService _sut;
    private readonly Guid _masterUserId = Guid.CreateVersion7();

    public CampaignAdminServiceTests() {
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockOptions.Value.Returns(new PublicLibraryOptions { MasterUserId = _masterUserId });

        _mockCampaignStorage = Substitute.For<ICampaignStorage>();
        _mockAdventureStorage = Substitute.For<IAdventureStorage>();
        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<CampaignAdminService>>();
        _sut = new CampaignAdminService(_mockOptions, _mockCampaignStorage, _mockAdventureStorage, _mockUserManager, _mockLogger);
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public ValueTask DisposeAsync() {
        GC.SuppressFinalize(this);
        return ValueTask.CompletedTask;
    }

    [Fact]
    public async Task SearchCampaignsAsync_WithValidRequest_ReturnsPagedResults() {
        var campaigns = CreateTestCampaigns(15);
        _mockCampaignStorage.SearchAsync(_masterUserId, Arg.Any<LibrarySearchFilter>(), Arg.Any<CancellationToken>())
            .Returns(([.. campaigns.Take(11)], 15));

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };

        var result = await _sut.SearchCampaignsAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(10);
        result.TotalCount.Should().Be(15);
        result.HasMore.Should().BeTrue();
    }

    [Fact]
    public async Task SearchCampaignsAsync_WithSearchTerm_CallsStorageWithCorrectFilter() {
        _mockCampaignStorage.SearchAsync(_masterUserId, Arg.Any<LibrarySearchFilter>(), Arg.Any<CancellationToken>())
            .Returns(([], 0));

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Search = "dragon", Skip = 0, Take = 10 };

        await _sut.SearchCampaignsAsync(request, TestContext.Current.CancellationToken);

        await _mockCampaignStorage.Received(1).SearchAsync(
            _masterUserId,
            Arg.Is<LibrarySearchFilter>(f => f.Search == "dragon"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCampaignByIdAsync_WithExistingCampaign_ReturnsCampaign() {
        var campaign = CreateTestCampaign("Test Campaign", "Description");
        _mockCampaignStorage.GetByIdAsync(campaign.Id, Arg.Any<CancellationToken>())
            .Returns(campaign);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetCampaignByIdAsync(campaign.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Id.Should().Be(campaign.Id);
    }

    [Fact]
    public async Task GetCampaignByIdAsync_WithNonExistentCampaign_ReturnsNull() {
        _mockCampaignStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((CampaignModel?)null);

        var result = await _sut.GetCampaignByIdAsync(Guid.CreateVersion7(), TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateCampaignAsync_WithValidData_CreatesCampaign() {
        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CreateCampaignAsync("New Campaign", "Description", TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Campaign");
        result.IsPublished.Should().BeFalse();

        await _mockCampaignStorage.Received(1).AddAsync(
            Arg.Is<CampaignModel>(c => c.Name == "New Campaign" && c.OwnerId == _masterUserId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateCampaignAsync_WithEmptyName_ThrowsArgumentException() {
        var act = () => _sut.CreateCampaignAsync("", "Description", default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task UpdateCampaignAsync_WithValidData_UpdatesCampaign() {
        var campaign = CreateTestCampaign("Old Name", "Old description");
        _mockCampaignStorage.GetByIdAsync(campaign.Id, Arg.Any<CancellationToken>())
            .Returns(campaign);
        _mockCampaignStorage.UpdateAsync(Arg.Any<CampaignModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.UpdateCampaignAsync(campaign.Id, "New Name", "New desc", true, true, TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Name");
        result.IsPublished.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateCampaignAsync_WithNonExistentCampaign_ThrowsInvalidOperationException() {
        _mockCampaignStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((CampaignModel?)null);

        var act = () => _sut.UpdateCampaignAsync(Guid.CreateVersion7(), "Name", "Desc", null, null, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task DeleteCampaignAsync_WithExistingCampaign_DeletesCampaign() {
        var campaignId = Guid.CreateVersion7();
        _mockCampaignStorage.DeleteAsync(campaignId, Arg.Any<CancellationToken>())
            .Returns(true);

        await _sut.DeleteCampaignAsync(campaignId, TestContext.Current.CancellationToken);

        await _mockCampaignStorage.Received(1).DeleteAsync(campaignId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteCampaignAsync_WithNonExistentCampaign_DoesNotThrow() {
        _mockCampaignStorage.DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(false);

        var act = () => _sut.DeleteCampaignAsync(Guid.CreateVersion7(), default);

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task TransferCampaignOwnershipAsync_WithTakeAction_TransfersToMaster() {
        var campaign = CreateTestCampaign("Test", "Desc", Guid.CreateVersion7());
        _mockCampaignStorage.GetByIdAsync(campaign.Id, Arg.Any<CancellationToken>())
            .Returns(campaign);
        _mockCampaignStorage.UpdateAsync(Arg.Any<CampaignModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var request = new TransferOwnershipRequest { Action = "take" };

        await _sut.TransferCampaignOwnershipAsync(campaign.Id, request, TestContext.Current.CancellationToken);

        await _mockCampaignStorage.Received(1).UpdateAsync(
            Arg.Is<CampaignModel>(c => c.OwnerId == _masterUserId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task TransferCampaignOwnershipAsync_WithGrantAction_TransfersToTarget() {
        var targetUserId = Guid.CreateVersion7();
        var campaign = CreateTestCampaign("Test", "Desc", _masterUserId);
        _mockCampaignStorage.GetByIdAsync(campaign.Id, Arg.Any<CancellationToken>())
            .Returns(campaign);
        _mockCampaignStorage.UpdateAsync(Arg.Any<CampaignModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var request = new TransferOwnershipRequest { Action = "grant", TargetUserId = targetUserId };

        await _sut.TransferCampaignOwnershipAsync(campaign.Id, request, TestContext.Current.CancellationToken);

        await _mockCampaignStorage.Received(1).UpdateAsync(
            Arg.Is<CampaignModel>(c => c.OwnerId == targetUserId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task TransferCampaignOwnershipAsync_WithInvalidAction_ThrowsInvalidOperationException() {
        var campaign = CreateTestCampaign("Test", "Desc");
        _mockCampaignStorage.GetByIdAsync(campaign.Id, Arg.Any<CancellationToken>())
            .Returns(campaign);

        var request = new TransferOwnershipRequest { Action = "invalid" };

        var act = () => _sut.TransferCampaignOwnershipAsync(campaign.Id, request, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task GetAdventuresByCampaignIdAsync_WithAdventures_ReturnsAdventures() {
        var campaign = CreateTestCampaign("Campaign", "Desc");
        var adventures = new[] {
            CreateTestAdventure("Adventure 1", "Desc 1"),
            CreateTestAdventure("Adventure 2", "Desc 2")
        };
        _mockAdventureStorage.GetByCampaignIdAsync(campaign.Id, Arg.Any<CancellationToken>())
            .Returns(adventures);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetAdventuresByCampaignIdAsync(campaign.Id, TestContext.Current.CancellationToken);

        result.Count.Should().Be(2);
    }

    [Fact]
    public async Task GetAdventuresByCampaignIdAsync_WithNoAdventures_ReturnsEmptyList() {
        _mockAdventureStorage.GetByCampaignIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns([]);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetAdventuresByCampaignIdAsync(Guid.CreateVersion7(), TestContext.Current.CancellationToken);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task CreateAdventureForCampaignAsync_WithValidData_CreatesAdventure() {
        var campaign = CreateTestCampaign("Campaign", "Desc");
        _mockCampaignStorage.GetByIdAsync(campaign.Id, Arg.Any<CancellationToken>())
            .Returns(campaign);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CreateAdventureForCampaignAsync(campaign.Id, "New Adventure", "Desc", TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Adventure");

        await _mockAdventureStorage.Received(1).AddAsync(
            Arg.Is<AdventureModel>(a => a.Name == "New Adventure"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAdventureForCampaignAsync_WithNonExistentCampaign_ThrowsKeyNotFoundException() {
        _mockCampaignStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((CampaignModel?)null);

        var act = () => _sut.CreateAdventureForCampaignAsync(Guid.CreateVersion7(), "Adventure", "Desc", default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task CloneAdventureAsync_WithValidData_ClonesAdventure() {
        var campaignId = Guid.CreateVersion7();
        var adventure = CreateTestAdventure("Original", "Original desc");
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CloneAdventureAsync(campaignId, adventure.Id, "Cloned", TestContext.Current.CancellationToken);

        result.Name.Should().Be("Cloned");

        await _mockAdventureStorage.Received(1).AddAsync(
            Arg.Is<AdventureModel>(a => a.Name == "Cloned" && a.Id != adventure.Id),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneAdventureAsync_WithoutNewName_UsesDefaultName() {
        var campaignId = Guid.CreateVersion7();
        var adventure = CreateTestAdventure("Original", "Original desc");
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CloneAdventureAsync(campaignId, adventure.Id, null, TestContext.Current.CancellationToken);

        result.Name.Should().Be("Original (Copy)");
    }

    [Fact]
    public async Task CloneAdventureAsync_WithNonExistentAdventure_ThrowsKeyNotFoundException() {
        _mockAdventureStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((AdventureModel?)null);

        var act = () => _sut.CloneAdventureAsync(Guid.CreateVersion7(), Guid.CreateVersion7(), "Cloned", default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task RemoveAdventureFromCampaignAsync_WithValidData_RemovesAdventure() {
        var campaignId = Guid.CreateVersion7();
        var adventure = CreateTestAdventure("Adventure", "Desc");
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);
        _mockAdventureStorage.DeleteAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(true);

        await _sut.RemoveAdventureFromCampaignAsync(campaignId, adventure.Id, TestContext.Current.CancellationToken);

        await _mockAdventureStorage.Received(1).DeleteAsync(adventure.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveAdventureFromCampaignAsync_WithNonExistentAdventure_ThrowsKeyNotFoundException() {
        _mockAdventureStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((AdventureModel?)null);

        var act = () => _sut.RemoveAdventureFromCampaignAsync(Guid.CreateVersion7(), Guid.CreateVersion7(), default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private CampaignModel CreateTestCampaign(string name, string description, Guid? ownerId = null) => new() {
        Id = Guid.CreateVersion7(),
        OwnerId = ownerId ?? _masterUserId,
        Name = name,
        Description = description,
        IsPublished = false,
        IsPublic = false
    };

    private CampaignModel[] CreateTestCampaigns(int count) {
        var campaigns = new CampaignModel[count];
        for (var i = 0; i < count; i++) {
            campaigns[i] = CreateTestCampaign($"Campaign {i}", $"Description {i}");
        }
        return campaigns;
    }

    private AdventureModel CreateTestAdventure(string name, string description) => new() {
        Id = Guid.CreateVersion7(),
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
