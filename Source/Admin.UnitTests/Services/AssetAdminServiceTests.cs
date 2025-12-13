using AssetModel = VttTools.Assets.Model.Asset;
using AssetKind = VttTools.Assets.Model.AssetKind;
using AssetClassification = VttTools.Assets.Model.AssetClassification;

namespace VttTools.Admin.UnitTests.Services;

public sealed class AssetAdminServiceTests : IAsyncLifetime {
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly IAssetStorage _mockAssetStorage;
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<AssetAdminService> _mockLogger;
    private readonly AssetAdminService _sut;
    private readonly Guid _masterUserId = Guid.CreateVersion7();

    public AssetAdminServiceTests() {
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockOptions.Value.Returns(new PublicLibraryOptions { MasterUserId = _masterUserId });

        _mockAssetStorage = Substitute.For<IAssetStorage>();
        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<AssetAdminService>>();
        _sut = new AssetAdminService(_mockOptions, _mockAssetStorage, _mockUserManager, _mockLogger);
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public ValueTask DisposeAsync() {
        GC.SuppressFinalize(this);
        return ValueTask.CompletedTask;
    }

    #region SearchAssetsAsync Tests

    [Fact]
    public async Task SearchAssetsAsync_WithValidRequest_ReturnsPagedResults() {
        var assets = CreateTestAssets(15);
        _mockAssetStorage.SearchAsync(
                _masterUserId,
                Arg.Any<Availability?>(),
                Arg.Any<AssetKind?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string[]?>(),
                Arg.Any<ICollection<AdvancedSearchFilter>?>(),
                Arg.Any<AssetSortBy?>(),
                Arg.Any<SortDirection?>(),
                Arg.Any<Pagination?>(),
                Arg.Any<CancellationToken>())
            .Returns(([.. assets.Take(11)], 15));

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
    public async Task SearchAssetsAsync_WithKindFilter_CallsStorageWithCorrectKind() {
        _mockAssetStorage.SearchAsync(
                _masterUserId,
                Arg.Any<Availability?>(),
                Arg.Any<AssetKind?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string[]?>(),
                Arg.Any<ICollection<AdvancedSearchFilter>?>(),
                Arg.Any<AssetSortBy?>(),
                Arg.Any<SortDirection?>(),
                Arg.Any<Pagination?>(),
                Arg.Any<CancellationToken>())
            .Returns(([], 0));

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Kind = "Character", Skip = 0, Take = 10 };

        await _sut.SearchAssetsAsync(request, TestContext.Current.CancellationToken);

        await _mockAssetStorage.Received(1).SearchAsync(
            _masterUserId,
            Arg.Any<Availability?>(),
            AssetKind.Character,
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string[]?>(),
            Arg.Any<ICollection<AdvancedSearchFilter>?>(),
            Arg.Any<AssetSortBy?>(),
            Arg.Any<SortDirection?>(),
            Arg.Any<Pagination?>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SearchAssetsAsync_WithCategoryFilter_CallsStorageWithCorrectCategory() {
        _mockAssetStorage.SearchAsync(
                _masterUserId,
                Arg.Any<Availability?>(),
                Arg.Any<AssetKind?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string[]?>(),
                Arg.Any<ICollection<AdvancedSearchFilter>?>(),
                Arg.Any<AssetSortBy?>(),
                Arg.Any<SortDirection?>(),
                Arg.Any<Pagination?>(),
                Arg.Any<CancellationToken>())
            .Returns(([], 0));

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Category = "Heroes", Skip = 0, Take = 10 };

        await _sut.SearchAssetsAsync(request, TestContext.Current.CancellationToken);

        await _mockAssetStorage.Received(1).SearchAsync(
            _masterUserId,
            Arg.Any<Availability?>(),
            Arg.Any<AssetKind?>(),
            "Heroes",
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string[]?>(),
            Arg.Any<ICollection<AdvancedSearchFilter>?>(),
            Arg.Any<AssetSortBy?>(),
            Arg.Any<SortDirection?>(),
            Arg.Any<Pagination?>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SearchAssetsAsync_WithSearchTerm_CallsStorageWithCorrectSearch() {
        _mockAssetStorage.SearchAsync(
                _masterUserId,
                Arg.Any<Availability?>(),
                Arg.Any<AssetKind?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string?>(),
                Arg.Any<string[]?>(),
                Arg.Any<ICollection<AdvancedSearchFilter>?>(),
                Arg.Any<AssetSortBy?>(),
                Arg.Any<SortDirection?>(),
                Arg.Any<Pagination?>(),
                Arg.Any<CancellationToken>())
            .Returns(([], 0));

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Search = "dragon", Skip = 0, Take = 10 };

        await _sut.SearchAssetsAsync(request, TestContext.Current.CancellationToken);

        await _mockAssetStorage.Received(1).SearchAsync(
            _masterUserId,
            Arg.Any<Availability?>(),
            Arg.Any<AssetKind?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            Arg.Any<string?>(),
            "dragon",
            Arg.Any<string[]?>(),
            Arg.Any<ICollection<AdvancedSearchFilter>?>(),
            Arg.Any<AssetSortBy?>(),
            Arg.Any<SortDirection?>(),
            Arg.Any<Pagination?>(),
            Arg.Any<CancellationToken>());
    }

    #endregion

    #region GetAssetByIdAsync Tests

    [Fact]
    public async Task GetAssetByIdAsync_WithExistingAsset_ReturnsAsset() {
        var asset = CreateTestAsset("Test Asset", "Test description");
        _mockAssetStorage.FindByIdAsync(_masterUserId, asset.Id, Arg.Any<CancellationToken>())
            .Returns(asset);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetAssetByIdAsync(asset.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result!.Id.Should().Be(asset.Id);
        result.Name.Should().Be("Test Asset");
    }

    [Fact]
    public async Task GetAssetByIdAsync_WithNonExistentAsset_ReturnsNull() {
        _mockAssetStorage.FindByIdAsync(_masterUserId, Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((AssetModel?)null);

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

        await _mockAssetStorage.Received(1).AddAsync(
            Arg.Is<AssetModel>(a => a.Name == "New Asset" && a.OwnerId == _masterUserId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAssetAsync_WithEmptyName_ThrowsArgumentException() {
        var act = () => _sut.CreateAssetAsync("", "Description", default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task CreateAssetAsync_WithNullName_ThrowsArgumentException() {
        var act = () => _sut.CreateAssetAsync(null!, "Description", default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    #endregion

    #region UpdateAssetAsync Tests

    [Fact]
    public async Task UpdateAssetAsync_WithValidData_UpdatesAsset() {
        var asset = CreateTestAsset("Old Name", "Old description");
        _mockAssetStorage.FindByIdAsync(_masterUserId, asset.Id, Arg.Any<CancellationToken>())
            .Returns(asset);
        _mockAssetStorage.UpdateAsync(Arg.Any<AssetModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

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
        _mockAssetStorage.FindByIdAsync(_masterUserId, Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((AssetModel?)null);

        var act = () => _sut.UpdateAssetAsync(Guid.CreateVersion7(), "Name", "Desc", null, null, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task UpdateAssetAsync_WithPartialUpdate_UpdatesOnlySpecifiedFields() {
        var asset = CreateTestAsset("Name", "Description", isPublished: false);
        _mockAssetStorage.FindByIdAsync(_masterUserId, asset.Id, Arg.Any<CancellationToken>())
            .Returns(asset);
        _mockAssetStorage.UpdateAsync(Arg.Any<AssetModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.UpdateAssetAsync(
            asset.Id,
            null,
            null,
            true,
            null,
            TestContext.Current.CancellationToken);

        result.Name.Should().Be("Name");
        result.Description.Should().Be("Description");
        result.IsPublished.Should().BeTrue();
    }

    #endregion

    #region DeleteAssetAsync Tests

    [Fact]
    public async Task DeleteAssetAsync_WithExistingAsset_DeletesAsset() {
        var assetId = Guid.CreateVersion7();
        _mockAssetStorage.DeleteAsync(assetId, Arg.Any<CancellationToken>())
            .Returns(true);

        await _sut.DeleteAssetAsync(assetId, TestContext.Current.CancellationToken);

        await _mockAssetStorage.Received(1).DeleteAsync(assetId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAssetAsync_WithNonExistentAsset_DoesNotThrow() {
        _mockAssetStorage.DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(false);

        var act = () => _sut.DeleteAssetAsync(Guid.CreateVersion7(), default);

        await act.Should().NotThrowAsync();
    }

    #endregion

    #region TransferAssetOwnershipAsync Tests

    [Fact]
    public async Task TransferAssetOwnershipAsync_WithTakeAction_TransfersToMaster() {
        var asset = CreateTestAsset("Test", "Desc", Guid.CreateVersion7());
        _mockAssetStorage.FindByIdAsync(_masterUserId, asset.Id, Arg.Any<CancellationToken>())
            .Returns(asset);
        _mockAssetStorage.UpdateAsync(Arg.Any<AssetModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var request = new TransferOwnershipRequest { Action = "take" };

        await _sut.TransferAssetOwnershipAsync(asset.Id, request, TestContext.Current.CancellationToken);

        await _mockAssetStorage.Received(1).UpdateAsync(
            Arg.Is<AssetModel>(a => a.OwnerId == _masterUserId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task TransferAssetOwnershipAsync_WithGrantAction_TransfersToTarget() {
        var targetUserId = Guid.CreateVersion7();
        var asset = CreateTestAsset("Test", "Desc", _masterUserId);
        _mockAssetStorage.FindByIdAsync(_masterUserId, asset.Id, Arg.Any<CancellationToken>())
            .Returns(asset);
        _mockAssetStorage.UpdateAsync(Arg.Any<AssetModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var request = new TransferOwnershipRequest { Action = "grant", TargetUserId = targetUserId };

        await _sut.TransferAssetOwnershipAsync(asset.Id, request, TestContext.Current.CancellationToken);

        await _mockAssetStorage.Received(1).UpdateAsync(
            Arg.Is<AssetModel>(a => a.OwnerId == targetUserId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task TransferAssetOwnershipAsync_WithInvalidAction_ThrowsInvalidOperationException() {
        var asset = CreateTestAsset("Test", "Desc");
        _mockAssetStorage.FindByIdAsync(_masterUserId, asset.Id, Arg.Any<CancellationToken>())
            .Returns(asset);

        var request = new TransferOwnershipRequest { Action = "invalid" };

        var act = () => _sut.TransferAssetOwnershipAsync(asset.Id, request, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task TransferAssetOwnershipAsync_WithNonExistentAsset_ThrowsInvalidOperationException() {
        _mockAssetStorage.FindByIdAsync(_masterUserId, Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((AssetModel?)null);

        var request = new TransferOwnershipRequest { Action = "take" };

        var act = () => _sut.TransferAssetOwnershipAsync(Guid.CreateVersion7(), request, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    #endregion

    #region GetAssetTaxonomyAsync Tests

    [Fact]
    public async Task GetAssetTaxonomyAsync_WithAssets_ReturnsTaxonomy() {
        var assets = new[] {
            CreateTestAsset("Asset 1", kind: AssetKind.Character, category: "Heroes", type: "Warrior"),
            CreateTestAsset("Asset 2", kind: AssetKind.Character, category: "Heroes", type: "Mage"),
            CreateTestAsset("Asset 3", kind: AssetKind.Object, category: "Markers", type: "Status")
        };
        _mockAssetStorage.GetAllAsync(Arg.Any<CancellationToken>())
            .Returns(assets);

        var result = await _sut.GetAssetTaxonomyAsync(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Count.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetAssetTaxonomyAsync_WithNoAssets_ReturnsEmptyTaxonomy() {
        _mockAssetStorage.GetAllAsync(Arg.Any<CancellationToken>())
            .Returns([]);

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

    private AssetModel CreateTestAsset(
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
            Classification = new AssetClassification(kind, category ?? string.Empty, type ?? string.Empty, subtype),
            IsPublished = isPublished,
            IsPublic = isPublic
        };

    private AssetModel[] CreateTestAssets(int count) {
        var assets = new AssetModel[count];
        for (var i = 0; i < count; i++) {
            assets[i] = CreateTestAsset($"Asset {i}", $"Description {i}");
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
