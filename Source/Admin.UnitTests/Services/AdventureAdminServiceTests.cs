using AdventureModel = VttTools.Library.Adventures.Model.Adventure;
using EncounterModel = VttTools.Library.Encounters.Model.Encounter;

namespace VttTools.Admin.Services;

public sealed class AdventureAdminServiceTests : IAsyncLifetime {
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly IAdventureStorage _mockAdventureStorage;
    private readonly IEncounterStorage _mockEncounterStorage;
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<AdventureAdminService> _mockLogger;
    private readonly AdventureAdminService _sut;
    private readonly Guid _masterUserId = Guid.CreateVersion7();

    public AdventureAdminServiceTests() {
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockOptions.Value.Returns(new PublicLibraryOptions { MasterUserId = _masterUserId });

        _mockAdventureStorage = Substitute.For<IAdventureStorage>();
        _mockEncounterStorage = Substitute.For<IEncounterStorage>();
        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<AdventureAdminService>>();
        _sut = new(_mockOptions, _mockAdventureStorage, _mockEncounterStorage, _mockUserManager, _mockLogger);
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public ValueTask DisposeAsync() {
        GC.SuppressFinalize(this);
        return ValueTask.CompletedTask;
    }

    #region SearchAdventuresAsync Tests

    [Fact]
    public async Task SearchAdventuresAsync_WithValidRequest_ReturnsPagedResults() {
        var adventures = CreateTestAdventures(15);
        _mockAdventureStorage.SearchAsync(_masterUserId, Arg.Any<LibrarySearchFilter>(), Arg.Any<CancellationToken>())
            .Returns(([.. adventures.Take(11)], 15));

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };

        var result = await _sut.SearchAdventuresAsync(request, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Content.Should().NotBeNull();
        result.Content.Count.Should().Be(10);
        result.TotalCount.Should().Be(15);
        result.HasMore.Should().BeTrue();
    }

    [Fact]
    public async Task SearchAdventuresAsync_WithSearchTerm_CallsStorageWithCorrectFilter() {
        _mockAdventureStorage.SearchAsync(_masterUserId, Arg.Any<LibrarySearchFilter>(), Arg.Any<CancellationToken>())
            .Returns(([], 0));

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Search = "dragon", Skip = 0, Take = 10 };

        await _sut.SearchAdventuresAsync(request, TestContext.Current.CancellationToken);

        await _mockAdventureStorage.Received(1).SearchAsync(
            _masterUserId,
            Arg.Is<LibrarySearchFilter>(f => f.Search == "dragon"),
            Arg.Any<CancellationToken>());
    }

    #endregion

    #region GetAdventureByIdAsync Tests

    [Fact]
    public async Task GetAdventureByIdAsync_WithExistingAdventure_ReturnsAdventure() {
        var adventure = CreateTestAdventure("Test Adventure", "Test description");
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetAdventureByIdAsync(adventure.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Id.Should().Be(adventure.Id);
        result.Name.Should().Be("Test Adventure");
    }

    [Fact]
    public async Task GetAdventureByIdAsync_WithNonExistentAdventure_ReturnsNull() {
        _mockAdventureStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((AdventureModel?)null);

        var result = await _sut.GetAdventureByIdAsync(Guid.CreateVersion7(), TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    #endregion

    #region CreateAdventureAsync Tests

    [Fact]
    public async Task CreateAdventureAsync_WithValidData_CreatesAdventure() {
        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CreateAdventureAsync("New Adventure", "Description", TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Name.Should().Be("New Adventure");
        result.Description.Should().Be("Description");
        result.IsPublished.Should().BeFalse();
        result.OwnerId.Should().Be(_masterUserId);

        await _mockAdventureStorage.Received(1).AddAsync(
            Arg.Is<AdventureModel>(a => a.Name == "New Adventure" && a.OwnerId == _masterUserId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAdventureAsync_WithEmptyName_ThrowsArgumentException() {
        var act = () => _sut.CreateAdventureAsync("", "Description", default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task CreateAdventureAsync_WithNullName_ThrowsArgumentException() {
        var act = () => _sut.CreateAdventureAsync(null!, "Description", default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    #endregion

    #region UpdateAdventureAsync Tests

    [Fact]
    public async Task UpdateAdventureAsync_WithValidData_UpdatesAdventure() {
        var adventure = CreateTestAdventure("Old Name", "Old description");
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);
        _mockAdventureStorage.UpdateAsync(Arg.Any<AdventureModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.UpdateAdventureAsync(
            adventure.Id,
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
    public async Task UpdateAdventureAsync_WithNonExistentAdventure_ThrowsKeyNotFoundException() {
        _mockAdventureStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((AdventureModel?)null);

        var act = () => _sut.UpdateAdventureAsync(Guid.CreateVersion7(), "Name", "Desc", null, null, default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task UpdateAdventureAsync_WithPartialUpdate_UpdatesOnlySpecifiedFields() {
        var adventure = CreateTestAdventure("Name", "Description", isPublished: false);
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);
        _mockAdventureStorage.UpdateAsync(Arg.Any<AdventureModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.UpdateAdventureAsync(
            adventure.Id,
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

    #region DeleteAdventureAsync Tests

    [Fact]
    public async Task DeleteAdventureAsync_WithExistingAdventure_DeletesAdventure() {
        var adventureId = Guid.CreateVersion7();
        _mockAdventureStorage.DeleteAsync(adventureId, Arg.Any<CancellationToken>())
            .Returns(true);

        await _sut.DeleteAdventureAsync(adventureId, TestContext.Current.CancellationToken);

        await _mockAdventureStorage.Received(1).DeleteAsync(adventureId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAdventureAsync_WithNonExistentAdventure_DoesNotThrow() {
        _mockAdventureStorage.DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(false);

        var act = () => _sut.DeleteAdventureAsync(Guid.CreateVersion7(), default);

        await act.Should().NotThrowAsync();
    }

    #endregion

    #region TransferAdventureOwnershipAsync Tests

    [Fact]
    public async Task TransferAdventureOwnershipAsync_WithTakeAction_TransfersToMaster() {
        var adventure = CreateTestAdventure("Test", "Desc", Guid.CreateVersion7());
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);
        _mockAdventureStorage.UpdateAsync(Arg.Any<AdventureModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var request = new TransferOwnershipRequest { Action = "take" };

        await _sut.TransferAdventureOwnershipAsync(adventure.Id, request, TestContext.Current.CancellationToken);

        await _mockAdventureStorage.Received(1).UpdateAsync(
            Arg.Is<AdventureModel>(a => a.OwnerId == _masterUserId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task TransferAdventureOwnershipAsync_WithGrantAction_TransfersToTarget() {
        var targetUserId = Guid.CreateVersion7();
        var adventure = CreateTestAdventure("Test", "Desc", _masterUserId);
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);
        _mockAdventureStorage.UpdateAsync(Arg.Any<AdventureModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var request = new TransferOwnershipRequest { Action = "grant", TargetUserId = targetUserId };

        await _sut.TransferAdventureOwnershipAsync(adventure.Id, request, TestContext.Current.CancellationToken);

        await _mockAdventureStorage.Received(1).UpdateAsync(
            Arg.Is<AdventureModel>(a => a.OwnerId == targetUserId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task TransferAdventureOwnershipAsync_WithInvalidAction_ThrowsArgumentException() {
        var adventure = CreateTestAdventure("Test", "Desc");
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);

        var request = new TransferOwnershipRequest { Action = "invalid" };

        var act = () => _sut.TransferAdventureOwnershipAsync(adventure.Id, request, default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task TransferAdventureOwnershipAsync_WithNonExistentAdventure_ThrowsKeyNotFoundException() {
        _mockAdventureStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((AdventureModel?)null);

        var request = new TransferOwnershipRequest { Action = "take" };

        var act = () => _sut.TransferAdventureOwnershipAsync(Guid.CreateVersion7(), request, default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    #endregion

    #region GetEncountersByAdventureIdAsync Tests

    [Fact]
    public async Task GetEncountersByAdventureIdAsync_WithEncounters_ReturnsEncounters() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        var encounters = new[] {
            CreateTestEncounter("Encounter 1", "Desc 1", adventure),
            CreateTestEncounter("Encounter 2", "Desc 2", adventure)
        };
        _mockEncounterStorage.GetByParentIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(encounters);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetEncountersByAdventureIdAsync(adventure.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Count.Should().Be(2);
    }

    [Fact]
    public async Task GetEncountersByAdventureIdAsync_WithNoEncounters_ReturnsEmptyList() {
        _mockEncounterStorage.GetByParentIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns([]);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetEncountersByAdventureIdAsync(Guid.CreateVersion7(), TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Count.Should().Be(0);
    }

    #endregion

    #region CreateEncounterForAdventureAsync Tests

    [Fact]
    public async Task CreateEncounterForAdventureAsync_WithValidData_CreatesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);

        var result = await _sut.CreateEncounterForAdventureAsync(
            adventure.Id,
            "New Encounter",
            "Encounter description",
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Name.Should().Be("New Encounter");
        result.IsPublished.Should().BeFalse();

        await _mockEncounterStorage.Received(1).AddAsync(
            Arg.Is<EncounterModel>(e => e.Name == "New Encounter"),
            adventure.Id,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateEncounterForAdventureAsync_WithNonExistentAdventure_ThrowsKeyNotFoundException() {
        _mockAdventureStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((AdventureModel?)null);

        var act = () => _sut.CreateEncounterForAdventureAsync(Guid.CreateVersion7(), "Name", "Desc", default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task CreateEncounterForAdventureAsync_WithEmptyName_ThrowsArgumentException() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        _mockAdventureStorage.GetByIdAsync(adventure.Id, Arg.Any<CancellationToken>())
            .Returns(adventure);

        var act = () => _sut.CreateEncounterForAdventureAsync(adventure.Id, "", "Desc", default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    #endregion

    #region CloneEncounterAsync Tests

    [Fact]
    public async Task CloneEncounterAsync_WithValidData_ClonesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        var encounter = CreateTestEncounter("Original", "Original desc", adventure);
        _mockEncounterStorage.GetByIdAsync(encounter.Id, Arg.Any<CancellationToken>())
            .Returns(encounter);

        var result = await _sut.CloneEncounterAsync(
            adventure.Id,
            encounter.Id,
            "Cloned",
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Name.Should().Be("Cloned");
        result.Description.Should().Be("Original desc");
        result.IsPublished.Should().BeFalse();

        await _mockEncounterStorage.Received(1).AddAsync(
            Arg.Is<EncounterModel>(e => e.Name == "Cloned"),
            adventure.Id,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CloneEncounterAsync_WithoutNewName_UsesDefaultName() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        var encounter = CreateTestEncounter("Original", "Desc", adventure);
        _mockEncounterStorage.GetByIdAsync(encounter.Id, Arg.Any<CancellationToken>())
            .Returns(encounter);

        var result = await _sut.CloneEncounterAsync(
            adventure.Id,
            encounter.Id,
            null,
            TestContext.Current.CancellationToken);

        result.Name.Should().Be("Original (Copy)");
    }

    [Fact]
    public async Task CloneEncounterAsync_WithNonExistentEncounter_ThrowsKeyNotFoundException() {
        _mockEncounterStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((EncounterModel?)null);

        var act = () => _sut.CloneEncounterAsync(Guid.CreateVersion7(), Guid.CreateVersion7(), null, default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    #endregion

    #region RemoveEncounterFromAdventureAsync Tests

    [Fact]
    public async Task RemoveEncounterFromAdventureAsync_WithValidData_RemovesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        var encounter = CreateTestEncounter("Encounter", "Desc", adventure);
        _mockEncounterStorage.GetByIdAsync(encounter.Id, Arg.Any<CancellationToken>())
            .Returns(encounter);
        _mockEncounterStorage.DeleteAsync(encounter.Id, Arg.Any<CancellationToken>())
            .Returns(true);

        await _sut.RemoveEncounterFromAdventureAsync(adventure.Id, encounter.Id, TestContext.Current.CancellationToken);

        await _mockEncounterStorage.Received(1).DeleteAsync(encounter.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveEncounterFromAdventureAsync_WithNonExistentEncounter_ThrowsKeyNotFoundException() {
        _mockEncounterStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((EncounterModel?)null);

        var act = () => _sut.RemoveEncounterFromAdventureAsync(Guid.CreateVersion7(), Guid.CreateVersion7(), default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    #endregion

    #region Helper Methods

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private AdventureModel CreateTestAdventure(
        string name,
        string description,
        Guid? ownerId = null,
        bool isPublished = false,
        bool isPublic = false) => new() {
            Id = Guid.CreateVersion7(),
            OwnerId = ownerId ?? _masterUserId,
            Name = name,
            Description = description,
            IsPublished = isPublished,
            IsPublic = isPublic
        };

    private AdventureModel[] CreateTestAdventures(int count) {
        var adventures = new AdventureModel[count];
        for (var i = 0; i < count; i++) {
            adventures[i] = CreateTestAdventure($"Adventure {i}", $"Description {i}");
        }
        return adventures;
    }

    private static EncounterModel CreateTestEncounter(string name, string description, AdventureModel adventure) => new() {
        Id = Guid.CreateVersion7(),
        Adventure = adventure,
        Name = name,
        Description = description,
        IsPublished = false
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

    #endregion
}
