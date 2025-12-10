namespace VttTools.Admin.UnitTests.Services;

public sealed class AssetAdminServiceTests : IAsyncLifetime {
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly ApplicationDbContext _mockDbContext;
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<AssetAdminService> _mockLogger;
    private readonly AssetAdminService _sut;
    private readonly Guid _masterUserId = Guid.CreateVersion7();

    public AssetAdminServiceTests() {
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockOptions.Value.Returns(new PublicLibraryOptions { MasterUserId = _masterUserId });

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"TestDb_{Guid.CreateVersion7()}")
            .Options;
        _mockDbContext = new ApplicationDbContext(options);

        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<AssetAdminService>>();
        _sut = new AssetAdminService(_mockOptions, _mockDbContext, _mockUserManager, _mockLogger);
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() {
        await _mockDbContext.DisposeAsync();
        GC.SuppressFinalize(this);
    }

    #region SearchAssetsAsync Tests

    [Fact]
    public async Task SearchAssetsAsync_WithValidRequest_ReturnsPagedResults() {
        var assets = CreateTestAssets(15);
        await _mockDbContext.Assets.AddRangeAsync(assets, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };

        var result = await _sut.SearchAssetsAsync(request, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Content.Count.Should().Be(10);
        result.TotalCount.Should().Be(15);
        result.HasMore.Should().BeTrue();
    }

    [Fact]
    public async Task SearchAssetsAsync_WithKindFilter_ReturnsFilteredResults() {
        var assets = new List<Data.Assets.Entities.Asset> {
            CreateTestAsset("Character 1", kind: AssetKind.Character),
            CreateTestAsset("Token 1", kind: AssetKind.Object),
            CreateTestAsset("Character 2", kind: AssetKind.Character)
        };
        await _mockDbContext.Assets.AddRangeAsync(assets, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Kind = "Character", Skip = 0, Take = 10 };

        var result = await _sut.SearchAssetsAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(2);
    }

    [Fact]
    public async Task SearchAssetsAsync_WithCategoryFilter_ReturnsFilteredResults() {
        var assets = new List<Data.Assets.Entities.Asset> {
            CreateTestAsset("Asset 1", category: "Heroes"),
            CreateTestAsset("Asset 2", category: "Villains"),
            CreateTestAsset("Asset 3", category: "Heroes")
        };
        await _mockDbContext.Assets.AddRangeAsync(assets, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Category = "Heroes", Skip = 0, Take = 10 };

        var result = await _sut.SearchAssetsAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(2);
    }

    [Fact]
    public async Task SearchAssetsAsync_WithSearchTerm_ReturnsFilteredResults() {
        var assets = new List<Data.Assets.Entities.Asset> {
            CreateTestAsset("Fire Dragon", "A red dragon"),
            CreateTestAsset("Ice Dragon", "A blue dragon"),
            CreateTestAsset("Wizard", "A powerful mage")
        };
        await _mockDbContext.Assets.AddRangeAsync(assets, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Search = "dragon", Skip = 0, Take = 10 };

        var result = await _sut.SearchAssetsAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(2);
    }

    #endregion

    #region GetAssetByIdAsync Tests

    [Fact]
    public async Task GetAssetByIdAsync_WithExistingAsset_ReturnsAsset() {
        var asset = CreateTestAsset("Test Asset", "Test description");
        await _mockDbContext.Assets.AddAsync(asset, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetAssetByIdAsync(asset.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result!.Id.Should().Be(asset.Id);
        result.Name.Should().Be("Test Asset");
    }

    [Fact]
    public async Task GetAssetByIdAsync_WithNonExistentAsset_ReturnsNull() {
        var result = await _sut.GetAssetByIdAsync(Guid.CreateVersion7(), TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    #endregion

    #region CreateAssetAsync Tests

    [Fact]
    public async Task CreateAssetAsync_WithValidData_CreatesAsset() {
        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CreateAssetAsync("New Asset", "Description", TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Name.Should().Be("New Asset");
        result.Description.Should().Be("Description");
        result.IsPublished.Should().BeFalse();
        result.OwnerId.Should().Be(_masterUserId);

        var saved = await _mockDbContext.Assets.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateAssetAsync_WithEmptyName_ThrowsArgumentException() {
        var act = () => _sut.CreateAssetAsync("", "Description", default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    #endregion

    #region UpdateAssetAsync Tests

    [Fact]
    public async Task UpdateAssetAsync_WithValidData_UpdatesAsset() {
        var asset = CreateTestAsset("Old Name", "Old description");
        await _mockDbContext.Assets.AddAsync(asset, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.UpdateAssetAsync(
            asset.Id,
            "New Name",
            "New description",
            true,
            true,
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Name.Should().Be("New Name");
        result.Description.Should().Be("New description");
        result.IsPublished.Should().BeTrue();
        result.IsPublic.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateAssetAsync_WithNonExistentAsset_ThrowsInvalidOperationException() {
        var act = () => _sut.UpdateAssetAsync(Guid.CreateVersion7(), "Name", "Desc", null, null, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    #endregion

    #region DeleteAssetAsync Tests

    [Fact]
    public async Task DeleteAssetAsync_WithExistingAsset_DeletesAsset() {
        var asset = CreateTestAsset("To Delete", "Description");
        await _mockDbContext.Assets.AddAsync(asset, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        await _sut.DeleteAssetAsync(asset.Id, TestContext.Current.CancellationToken);

        var deleted = await _mockDbContext.Assets.FindAsync([asset.Id], TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAssetAsync_WithNonExistentAsset_DoesNotThrow() {
        var act = () => _sut.DeleteAssetAsync(Guid.CreateVersion7(), default);

        await act.Should().NotThrowAsync();
    }

    #endregion

    #region TransferAssetOwnershipAsync Tests

    [Fact]
    public async Task TransferAssetOwnershipAsync_WithTakeAction_TransfersToMaster() {
        var asset = CreateTestAsset("Test", "Desc", Guid.CreateVersion7());
        await _mockDbContext.Assets.AddAsync(asset, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new TransferOwnershipRequest { Action = "take" };

        await _sut.TransferAssetOwnershipAsync(asset.Id, request, TestContext.Current.CancellationToken);

        var updated = await _mockDbContext.Assets.FindAsync([asset.Id], TestContext.Current.CancellationToken);
        updated!.OwnerId.Should().Be(_masterUserId);
    }

    [Fact]
    public async Task TransferAssetOwnershipAsync_WithGrantAction_TransfersToTarget() {
        var targetUserId = Guid.CreateVersion7();
        var asset = CreateTestAsset("Test", "Desc", _masterUserId);
        await _mockDbContext.Assets.AddAsync(asset, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new TransferOwnershipRequest { Action = "grant", TargetUserId = targetUserId };

        await _sut.TransferAssetOwnershipAsync(asset.Id, request, TestContext.Current.CancellationToken);

        var updated = await _mockDbContext.Assets.FindAsync([asset.Id], TestContext.Current.CancellationToken);
        updated!.OwnerId.Should().Be(targetUserId);
    }

    [Fact]
    public async Task TransferAssetOwnershipAsync_WithInvalidAction_ThrowsInvalidOperationException() {
        var asset = CreateTestAsset("Test", "Desc");
        await _mockDbContext.Assets.AddAsync(asset, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new TransferOwnershipRequest { Action = "invalid" };

        var act = () => _sut.TransferAssetOwnershipAsync(asset.Id, request, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    #endregion

    #region GetAssetTaxonomyAsync Tests

    [Fact]
    public async Task GetAssetTaxonomyAsync_WithAssets_ReturnsTaxonomy() {
        var assets = new List<Data.Assets.Entities.Asset> {
            CreateTestAsset("Asset 1", kind: AssetKind.Character, category: "Heroes", type: "Warrior", subtype: "Knight"),
            CreateTestAsset("Asset 2", kind: AssetKind.Character, category: "Heroes", type: "Mage", subtype: "Wizard"),
            CreateTestAsset("Asset 3", kind: AssetKind.Object, category: "Markers", type: "Status", subtype: null)
        };
        await _mockDbContext.Assets.AddRangeAsync(assets, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await _sut.GetAssetTaxonomyAsync(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Count.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetAssetTaxonomyAsync_WithNoAssets_ReturnsEmptyTaxonomy() {
        var result = await _sut.GetAssetTaxonomyAsync(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Count.Should().Be(0);
    }

    #endregion

    #region Helper Methods

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private Data.Assets.Entities.Asset CreateTestAsset(
        string name,
        string description = "Description",
        Guid? ownerId = null,
        bool isPublished = false,
        bool isPublic = false,
        AssetKind kind = AssetKind.Character,
        string? category = null,
        string? type = null,
        string? subtype = null) => new() {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId ?? _masterUserId,
            Name = name,
            Description = description,
            IsPublished = isPublished,
            IsPublic = isPublic,
            Kind = kind,
            Category = category ?? string.Empty,
            Type = type ?? string.Empty,
            Subtype = subtype ?? string.Empty
        };

    private List<Data.Assets.Entities.Asset> CreateTestAssets(int count) {
        var assets = new List<Data.Assets.Entities.Asset>();
        for (var i = 0; i < count; i++) {
            assets.Add(CreateTestAsset($"Asset {i}", $"Description {i}"));
        }
        return assets;
    }

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

    #endregion
}
