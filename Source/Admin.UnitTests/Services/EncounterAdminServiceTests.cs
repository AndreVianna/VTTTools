using AdventureModel = VttTools.Library.Adventures.Model.Adventure;
using EncounterModel = VttTools.Library.Encounters.Model.Encounter;

namespace VttTools.Admin.Services;

public sealed class EncounterAdminServiceTests : IAsyncLifetime {
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly IEncounterStorage _mockEncounterStorage;
    private readonly IAdventureStorage _mockAdventureStorage;
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<EncounterAdminService> _mockLogger;
    private readonly EncounterAdminService _sut;
    private readonly Guid _masterUserId = Guid.CreateVersion7();

    public EncounterAdminServiceTests() {
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockOptions.Value.Returns(new PublicLibraryOptions { MasterUserId = _masterUserId });

        _mockEncounterStorage = Substitute.For<IEncounterStorage>();
        _mockAdventureStorage = Substitute.For<IAdventureStorage>();
        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<EncounterAdminService>>();
        _sut = new(_mockOptions, _mockEncounterStorage, _mockAdventureStorage, _mockUserManager, _mockLogger);
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public ValueTask DisposeAsync() {
        GC.SuppressFinalize(this);
        return ValueTask.CompletedTask;
    }

    [Fact]
    public async Task SearchEncountersAsync_WithValidRequest_ReturnsPagedResults() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        var encounters = CreateTestEncounters(15, adventure);
        _mockEncounterStorage.SearchAsync(_masterUserId, Arg.Any<LibrarySearchFilter>(), Arg.Any<CancellationToken>())
            .Returns(([.. encounters.Take(11)], 15));

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };

        var result = await _sut.SearchEncountersAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(10);
        result.TotalCount.Should().Be(15);
        result.HasMore.Should().BeTrue();
    }

    [Fact]
    public async Task SearchEncountersAsync_WithSearchTerm_CallsStorageWithCorrectFilter() {
        _mockEncounterStorage.SearchAsync(_masterUserId, Arg.Any<LibrarySearchFilter>(), Arg.Any<CancellationToken>())
            .Returns(([], 0));

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Search = "dragon", Skip = 0, Take = 10 };

        await _sut.SearchEncountersAsync(request, TestContext.Current.CancellationToken);

        await _mockEncounterStorage.Received(1).SearchAsync(
            _masterUserId,
            Arg.Is<LibrarySearchFilter>(f => f.Search == "dragon"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetEncounterByIdAsync_WithExistingEncounter_ReturnsEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        var encounter = CreateTestEncounter("Test Encounter", "Description", adventure);
        _mockEncounterStorage.GetByIdAsync(encounter.Id, Arg.Any<CancellationToken>())
            .Returns(encounter);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetEncounterByIdAsync(encounter.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Id.Should().Be(encounter.Id);
    }

    [Fact]
    public async Task GetEncounterByIdAsync_WithNonExistentEncounter_ReturnsNull() {
        _mockEncounterStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((EncounterModel?)null);

        var result = await _sut.GetEncounterByIdAsync(Guid.CreateVersion7(), TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateEncounterAsync_WithValidData_CreatesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        _mockAdventureStorage.SearchAsync(_masterUserId, Arg.Any<LibrarySearchFilter>(), Arg.Any<CancellationToken>())
            .Returns(([adventure], 1));

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CreateEncounterAsync("New Encounter", "Description", TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Encounter");
        result.IsPublished.Should().BeFalse();

        await _mockEncounterStorage.Received(1).AddAsync(
            Arg.Is<EncounterModel>(e => e.Name == "New Encounter"),
            adventure.Id,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateEncounterAsync_WithNoDefaultAdventure_ThrowsInvalidOperationException() {
        _mockAdventureStorage.SearchAsync(_masterUserId, Arg.Any<LibrarySearchFilter>(), Arg.Any<CancellationToken>())
            .Returns(([], 0));

        var act = () => _sut.CreateEncounterAsync("Encounter", "Description", default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task UpdateEncounterAsync_WithValidData_UpdatesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        var encounter = CreateTestEncounter("Old Name", "Old desc", adventure);
        _mockEncounterStorage.GetByIdAsync(encounter.Id, Arg.Any<CancellationToken>())
            .Returns(encounter);
        _mockEncounterStorage.UpdateAsync(Arg.Any<EncounterModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.UpdateEncounterAsync(encounter.Id, "New Name", "New desc", true, true, TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Name");
        result.IsPublished.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteEncounterAsync_WithExistingEncounter_DeletesEncounter() {
        var encounterId = Guid.CreateVersion7();
        _mockEncounterStorage.DeleteAsync(encounterId, Arg.Any<CancellationToken>())
            .Returns(true);

        await _sut.DeleteEncounterAsync(encounterId, TestContext.Current.CancellationToken);

        await _mockEncounterStorage.Received(1).DeleteAsync(encounterId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task TransferEncounterOwnershipAsync_WithTakeAction_TransfersToMaster() {
        var adventure = CreateTestAdventure("Adventure", "Desc", Guid.CreateVersion7());
        var encounter = CreateTestEncounter("Encounter", "Desc", adventure);
        _mockEncounterStorage.GetByIdAsync(encounter.Id, Arg.Any<CancellationToken>())
            .Returns(encounter);
        _mockAdventureStorage.UpdateAsync(Arg.Any<AdventureModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var request = new TransferOwnershipRequest { Action = "take" };

        await _sut.TransferEncounterOwnershipAsync(encounter.Id, request, TestContext.Current.CancellationToken);

        await _mockAdventureStorage.Received(1).UpdateAsync(
            Arg.Is<AdventureModel>(a => a.OwnerId == _masterUserId),
            Arg.Any<CancellationToken>());
    }

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private AdventureModel CreateTestAdventure(string name, string description, Guid? ownerId = null) => new() {
        Id = Guid.CreateVersion7(),
        OwnerId = ownerId ?? _masterUserId,
        Name = name,
        Description = description,
        IsPublished = false,
        IsPublic = false
    };

    private static EncounterModel CreateTestEncounter(string name, string description, AdventureModel adventure) => new() {
        Id = Guid.CreateVersion7(),
        Adventure = adventure,
        Name = name,
        Description = description,
        IsPublished = false
    };

    private static EncounterModel[] CreateTestEncounters(int count, AdventureModel adventure) {
        var encounters = new EncounterModel[count];
        for (var i = 0; i < count; i++) {
            encounters[i] = CreateTestEncounter($"Encounter {i}", $"Description {i}", adventure);
        }
        return encounters;
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
}
