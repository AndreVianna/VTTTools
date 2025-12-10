namespace VttTools.Admin.UnitTests.Services;

public sealed class AdventureAdminServiceTests : IAsyncLifetime {
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly ApplicationDbContext _mockDbContext;
    private readonly UserManager<User> _mockUserManager;
    private readonly ILogger<AdventureAdminService> _mockLogger;
    private readonly AdventureAdminService _sut;
    private readonly Guid _masterUserId = Guid.CreateVersion7();

    public AdventureAdminServiceTests() {
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockOptions.Value.Returns(new PublicLibraryOptions { MasterUserId = _masterUserId });

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"TestDb_{Guid.CreateVersion7()}")
            .Options;
        _mockDbContext = new ApplicationDbContext(options);

        _mockUserManager = CreateUserManagerMock();
        _mockLogger = Substitute.For<ILogger<AdventureAdminService>>();
        _sut = new AdventureAdminService(_mockOptions, _mockDbContext, _mockUserManager, _mockLogger);
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() {
        await _mockDbContext.DisposeAsync();
        GC.SuppressFinalize(this);
    }

    #region SearchAdventuresAsync Tests

    [Fact]
    public async Task SearchAdventuresAsync_WithValidRequest_ReturnsPagedResults() {
        var adventures = CreateTestAdventures(15);
        await _mockDbContext.Adventures.AddRangeAsync(adventures, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var ownerIds = adventures.Select(a => a.OwnerId).Distinct();
        var users = ownerIds.Select(id => CreateTestUser(id, $"user{id}@example.com", $"User {id}")).ToList();
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
    public async Task SearchAdventuresAsync_WithSearchTerm_ReturnsFilteredResults() {
        var adventures = new List<Adventure> {
            CreateTestAdventure("Dragon Quest", "Find dragons"),
            CreateTestAdventure("Wizard Tower", "Climb the tower"),
            CreateTestAdventure("Dragon's Lair", "Face the dragon")
        };
        await _mockDbContext.Adventures.AddRangeAsync(adventures, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { Search = "dragon", Skip = 0, Take = 10 };

        var result = await _sut.SearchAdventuresAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(2);
    }

    [Fact]
    public async Task SearchAdventuresAsync_WithOwnerTypeFilter_ReturnsMasterContent() {
        var adventures = new List<Adventure> {
            CreateTestAdventure("Master Adventure", "By master", _masterUserId),
            CreateTestAdventure("User Adventure", "By user", Guid.CreateVersion7())
        };
        await _mockDbContext.Adventures.AddRangeAsync(adventures, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(2);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { OwnerType = "master", Skip = 0, Take = 10 };

        var result = await _sut.SearchAdventuresAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(1);
        result.Content[0].Name.Should().Be("Master Adventure");
    }

    [Fact]
    public async Task SearchAdventuresAsync_WithIsPublishedFilter_ReturnsPublishedContent() {
        var adventures = new List<Adventure> {
            CreateTestAdventure("Published", "desc", isPublished: true),
            CreateTestAdventure("Draft", "desc", isPublished: false)
        };
        await _mockDbContext.Adventures.AddRangeAsync(adventures, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var request = new LibrarySearchRequest { IsPublished = true, Skip = 0, Take = 10 };

        var result = await _sut.SearchAdventuresAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(1);
        result.Content[0].IsPublished.Should().BeTrue();
    }

    #endregion

    #region GetAdventureByIdAsync Tests

    [Fact]
    public async Task GetAdventureByIdAsync_WithExistingAdventure_ReturnsAdventure() {
        var adventure = CreateTestAdventure("Test Adventure", "Test description");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var users = CreateTestUsers(1);
        _mockUserManager.Users.Returns(users.BuildMock());

        var result = await _sut.GetAdventureByIdAsync(adventure.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result!.Id.Should().Be(adventure.Id);
        result.Name.Should().Be("Test Adventure");
    }

    [Fact]
    public async Task GetAdventureByIdAsync_WithNonExistentAdventure_ReturnsNull() {
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

        var saved = await _mockDbContext.Adventures.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
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
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

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
    public async Task UpdateAdventureAsync_WithNonExistentAdventure_ThrowsInvalidOperationException() {
        var act = () => _sut.UpdateAdventureAsync(Guid.CreateVersion7(), "Name", "Desc", null, null, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task UpdateAdventureAsync_WithPartialUpdate_UpdatesOnlySpecifiedFields() {
        var adventure = CreateTestAdventure("Name", "Description", isPublished: false);
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

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
        var adventure = CreateTestAdventure("To Delete", "Description");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        await _sut.DeleteAdventureAsync(adventure.Id, TestContext.Current.CancellationToken);

        var deleted = await _mockDbContext.Adventures.FindAsync([adventure.Id], TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAdventureAsync_WithNonExistentAdventure_DoesNotThrow() {
        var act = () => _sut.DeleteAdventureAsync(Guid.CreateVersion7(), default);

        await act.Should().NotThrowAsync();
    }

    #endregion

    #region TransferAdventureOwnershipAsync Tests

    [Fact]
    public async Task TransferAdventureOwnershipAsync_WithTakeAction_TransfersToMaster() {
        var adventure = CreateTestAdventure("Test", "Desc", Guid.CreateVersion7());
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new TransferOwnershipRequest { Action = "take" };

        await _sut.TransferAdventureOwnershipAsync(adventure.Id, request, TestContext.Current.CancellationToken);

        var updated = await _mockDbContext.Adventures.FindAsync([adventure.Id], TestContext.Current.CancellationToken);
        updated!.OwnerId.Should().Be(_masterUserId);
    }

    [Fact]
    public async Task TransferAdventureOwnershipAsync_WithGrantAction_TransfersToTarget() {
        var targetUserId = Guid.CreateVersion7();
        var adventure = CreateTestAdventure("Test", "Desc", _masterUserId);
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new TransferOwnershipRequest { Action = "grant", TargetUserId = targetUserId };

        await _sut.TransferAdventureOwnershipAsync(adventure.Id, request, TestContext.Current.CancellationToken);

        var updated = await _mockDbContext.Adventures.FindAsync([adventure.Id], TestContext.Current.CancellationToken);
        updated!.OwnerId.Should().Be(targetUserId);
    }

    [Fact]
    public async Task TransferAdventureOwnershipAsync_WithInvalidAction_ThrowsInvalidOperationException() {
        var adventure = CreateTestAdventure("Test", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new TransferOwnershipRequest { Action = "invalid" };

        var act = () => _sut.TransferAdventureOwnershipAsync(adventure.Id, request, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task TransferAdventureOwnershipAsync_WithNonExistentAdventure_ThrowsInvalidOperationException() {
        var request = new TransferOwnershipRequest { Action = "take" };

        var act = () => _sut.TransferAdventureOwnershipAsync(Guid.CreateVersion7(), request, default);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    #endregion

    #region GetEncountersByAdventureIdAsync Tests

    [Fact]
    public async Task GetEncountersByAdventureIdAsync_WithEncounters_ReturnsEncounters() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);

        var encounters = new List<Encounter> {
            CreateTestEncounter("Encounter 1", "Desc 1", adventure.Id),
            CreateTestEncounter("Encounter 2", "Desc 2", adventure.Id)
        };
        await _mockDbContext.Encounters.AddRangeAsync(encounters, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await _sut.GetEncountersByAdventureIdAsync(adventure.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Count.Should().Be(2);
    }

    [Fact]
    public async Task GetEncountersByAdventureIdAsync_WithNoEncounters_ReturnsEmptyList() {
        var result = await _sut.GetEncountersByAdventureIdAsync(Guid.CreateVersion7(), TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Count.Should().Be(0);
    }

    #endregion

    #region CreateEncounterForAdventureAsync Tests

    [Fact]
    public async Task CreateEncounterForAdventureAsync_WithValidData_CreatesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await _sut.CreateEncounterForAdventureAsync(
            adventure.Id,
            "New Encounter",
            "Encounter description",
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Name.Should().Be("New Encounter");
        result.IsPublished.Should().BeFalse();

        var saved = await _mockDbContext.Encounters.FirstOrDefaultAsync(TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
        saved!.AdventureId.Should().Be(adventure.Id);
    }

    [Fact]
    public async Task CreateEncounterForAdventureAsync_WithNonExistentAdventure_ThrowsKeyNotFoundException() {
        var act = () => _sut.CreateEncounterForAdventureAsync(Guid.CreateVersion7(), "Name", "Desc", default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task CreateEncounterForAdventureAsync_WithEmptyName_ThrowsArgumentException() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var act = () => _sut.CreateEncounterForAdventureAsync(adventure.Id, "", "Desc", default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    #endregion

    #region CloneEncounterAsync Tests

    [Fact]
    public async Task CloneEncounterAsync_WithValidData_ClonesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);

        var encounter = CreateTestEncounter("Original", "Original desc", adventure.Id);
        await _mockDbContext.Encounters.AddAsync(encounter, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await _sut.CloneEncounterAsync(
            adventure.Id,
            encounter.Id,
            "Cloned",
            TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Name.Should().Be("Cloned");
        result.Description.Should().Be("Original desc");
        result.IsPublished.Should().BeFalse();

        var encounters = await _mockDbContext.Encounters.ToListAsync(TestContext.Current.CancellationToken);
        encounters.Count.Should().Be(2);
    }

    [Fact]
    public async Task CloneEncounterAsync_WithoutNewName_UsesDefaultName() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);

        var encounter = CreateTestEncounter("Original", "Desc", adventure.Id);
        await _mockDbContext.Encounters.AddAsync(encounter, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await _sut.CloneEncounterAsync(
            adventure.Id,
            encounter.Id,
            null,
            TestContext.Current.CancellationToken);

        result.Name.Should().Be("Original (Copy)");
    }

    [Fact]
    public async Task CloneEncounterAsync_WithNonExistentEncounter_ThrowsKeyNotFoundException() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var act = () => _sut.CloneEncounterAsync(adventure.Id, Guid.CreateVersion7(), null, default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    #endregion

    #region RemoveEncounterFromAdventureAsync Tests

    [Fact]
    public async Task RemoveEncounterFromAdventureAsync_WithValidData_RemovesEncounter() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);

        var encounter = CreateTestEncounter("Encounter", "Desc", adventure.Id);
        await _mockDbContext.Encounters.AddAsync(encounter, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        await _sut.RemoveEncounterFromAdventureAsync(adventure.Id, encounter.Id, TestContext.Current.CancellationToken);

        var deleted = await _mockDbContext.Encounters.FindAsync([encounter.Id], TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task RemoveEncounterFromAdventureAsync_WithNonExistentEncounter_ThrowsKeyNotFoundException() {
        var adventure = CreateTestAdventure("Adventure", "Desc");
        await _mockDbContext.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _mockDbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var act = () => _sut.RemoveEncounterFromAdventureAsync(adventure.Id, Guid.CreateVersion7(), default);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    #endregion

    #region Helper Methods

    private static UserManager<User> CreateUserManagerMock() {
        var userStore = Substitute.For<IUserStore<User>>();
        return Substitute.For<UserManager<User>>(
            userStore, null, null, null, null, null, null, null, null);
    }

    private Adventure CreateTestAdventure(
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

    private List<Adventure> CreateTestAdventures(int count) {
        var adventures = new List<Adventure>();
        for (var i = 0; i < count; i++) {
            adventures.Add(CreateTestAdventure($"Adventure {i}", $"Description {i}"));
        }
        return adventures;
    }

    private static Encounter CreateTestEncounter(string name, string description, Guid adventureId) => new() {
        Id = Guid.CreateVersion7(),
        AdventureId = adventureId,
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
