namespace VttTools.Admin.UnitTests.Services;

public sealed class EncounterAdminServiceTests : IAsyncLifetime {
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly ApplicationDbContext _mockDbContext;
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<EncounterAdminService> _mockLogger;
    private readonly EncounterAdminService _sut;
    private readonly Guid _masterUserId = Guid.CreateVersion7();

    public EncounterAdminServiceTests() {
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockOptions.Value.Returns(new PublicLibraryOptions { MasterUserId = _masterUserId });

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"TestDb_{Guid.CreateVersion7()}")
            .Options;
        _mockDbContext = new ApplicationDbContext(options);

        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<EncounterAdminService>>();
        _sut = new EncounterAdminService(_mockOptions, _mockDbContext, _mockUserManager, _mockLogger);
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() {
        await _mockDbContext.DisposeAsync();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task SearchEncountersAsync_WithValidRequest_ReturnsPagedResults() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);

        var encounters = CreateTestEncounters(15, adventure.Id);
        await _mockDbContext.Encounters.AddRangeAsync(encounters, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };

        var result = await _sut.SearchEncountersAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(10);
        result.TotalCount.Should().Be(15);
        result.HasMore.Should().BeTrue();
    }

    [Fact]
    public async Task SearchEncountersAsync_WithSearchTerm_ReturnsFilteredResults() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);

        var encounters = new List<Encounter> {
            CreateTestEncounter("Dragon Battle", "Fight a dragon", adventure.Id),
            CreateTestEncounter("Tower Defense", "Defend the tower", adventure.Id),
            CreateTestEncounter("Dragon's Lair", "Enter the lair", adventure.Id)
        };
        await _mockDbContext.Encounters.AddRangeAsync(encounters, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Search = "dragon", Skip = 0, Take = 10 };

        var result = await _sut.SearchEncountersAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(2);
    }

    [Fact]
    public async Task SearchEncountersAsync_WithOwnerTypeFilter_ReturnsMasterContent() {
        var masterAdventure = CreateTestAdventure("Master Adventure", "Desc", _masterUserId);
        var userAdventure = CreateTestAdventure("User Adventure", "Desc", Guid.CreateVersion7());
        await _mockDbContext.Adventures.AddRangeAsync([masterAdventure, userAdventure]);

        var encounters = new List<Encounter> {
            CreateTestEncounter("Master Encounter", "Desc", masterAdventure.Id),
            CreateTestEncounter("User Encounter", "Desc", userAdventure.Id)
        };
        await _mockDbContext.Encounters.AddRangeAsync(encounters, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { OwnerType = "master", Skip = 0, Take = 10 };

        var result = await _sut.SearchEncountersAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(1);
    }

    [Fact]
    public async Task GetEncounterByIdAsync_WithExistingEncounter_ReturnsEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);

        var encounter = CreateTestEncounter("Test Encounter", "Description", adventure.Id);
        await _mockDbContext.Encounters.AddAsync(encounter, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetEncounterByIdAsync(encounter.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result!.Id.Should().Be(encounter.Id);
    }

    [Fact]
    public async Task GetEncounterByIdAsync_WithNonExistentEncounter_ReturnsNull() {
        var result = await _sut.GetEncounterByIdAsync(Guid.CreateVersion7(), TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateEncounterAsync_WithValidData_CreatesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.CreateEncounterAsync("New Encounter", "Description", TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Encounter");
        result.IsPublished.Should().BeFalse();

        var saved = await _mockDbContext.Encounters.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateEncounterAsync_WithNoDefaultAdventure_ThrowsInvalidOperationException() {
        var act = () => _sut.CreateEncounterAsync("Encounter", "Description", default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task UpdateEncounterAsync_WithValidData_UpdatesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);

        var encounter = CreateTestEncounter("Old Name", "Old desc", adventure.Id);
        await _mockDbContext.Encounters.AddAsync(encounter, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.UpdateEncounterAsync(encounter.Id, "New Name", "New desc", true, TestContext.Current.CancellationToken);

        result.Name.Should().Be("New Name");
        result.IsPublished.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteEncounterAsync_WithExistingEncounter_DeletesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);

        var encounter = CreateTestEncounter("To Delete", "Description", adventure.Id);
        await _mockDbContext.Encounters.AddAsync(encounter, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        await _sut.DeleteEncounterAsync(encounter.Id, TestContext.Current.CancellationToken);

        var deleted = await _mockDbContext.Encounters.FindAsync([encounter.Id], TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task TransferEncounterOwnershipAsync_WithTakeAction_TransfersToMaster() {
        var adventure = CreateTestAdventure("Adventure", "Desc", Guid.CreateVersion7());
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);

        var encounter = CreateTestEncounter("Encounter", "Desc", adventure.Id);
        await _mockDbContext.Encounters.AddAsync(encounter, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new TransferOwnershipRequest { Action = "take" };

        await _sut.TransferEncounterOwnershipAsync(encounter.Id, request, TestContext.Current.CancellationToken);

        var updated = await _mockDbContext.Adventures.FindAsync([adventure.Id], TestContext.Current.CancellationToken);
        updated!.OwnerId.Should().Be(_masterUserId);
    }

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private Adventure CreateTestAdventure(string name, string description, Guid? ownerId = null) => new() {
        Id = Guid.CreateVersion7(),
        OwnerId = ownerId ?? _masterUserId,
        Name = name,
        Description = description,
        IsPublished = false,
        IsPublic = false
    };

    private static Encounter CreateTestEncounter(string name, string description, Guid adventureId) => new() {
        Id = Guid.CreateVersion7(),
        AdventureId = adventureId,
        Name = name,
        Description = description,
        IsPublished = false
    };

    private static List<Encounter> CreateTestEncounters(int count, Guid adventureId) {
        var encounters = new List<Encounter>();
        for (var i = 0; i < count; i++) {
            encounters.Add(CreateTestEncounter($"Encounter {i}", $"Description {i}", adventureId));
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
