namespace VttTools.Admin.Services;

public sealed class WorldAdminServiceTests {
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly IWorldStorage _mockWorldStorage;
    private readonly ICampaignStorage _mockCampaignStorage;
    private readonly IUserStorage _mockUserStorage;
    private readonly ILogger<WorldAdminService> _mockLogger;
    private readonly WorldAdminService _sut;
    private readonly Guid _masterUserId = Guid.CreateVersion7();

    public WorldAdminServiceTests() {
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockOptions.Value.Returns(new PublicLibraryOptions { MasterUserId = _masterUserId });

        _mockWorldStorage = Substitute.For<IWorldStorage>();
        _mockCampaignStorage = Substitute.For<ICampaignStorage>();
        _mockUserStorage = Substitute.For<IUserStorage>();
        _mockLogger = Substitute.For<ILogger<WorldAdminService>>();
        _sut = new(_mockOptions, _mockWorldStorage, _mockCampaignStorage, _mockUserStorage, _mockLogger);
    }

    [Fact]
    public async Task SearchWorldsAsync_WithValidRequest_ReturnsPagedResults() {
        var worlds = CreateTestWorlds(15);
        _mockWorldStorage.SearchAsync(_masterUserId, Arg.Any<LibrarySearchFilter>(), Arg.Any<CancellationToken>())
            .Returns(([.. worlds.Take(10)], 15));

        var users = CreateTestUsers(1);
        SetupUserStorageMock(users);

        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };

        var result = await _sut.SearchWorldsAsync(request, TestContext.Current.CancellationToken);

        result.Content.Count.Should().Be(10);
        result.TotalCount.Should().Be(15);
    }

    [Fact]
    public async Task GetWorldByIdAsync_WithExistingWorld_ReturnsWorld() {
        var world = CreateTestWorld("Test World", "Test description");
        _mockWorldStorage.GetByIdAsync(world.Id, Arg.Any<CancellationToken>())
            .Returns(world);

        var users = CreateTestUsers(1);
        SetupUserStorageMock(users);

        var result = await _sut.GetWorldByIdAsync(world.Id, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Id.Should().Be(world.Id);
        result.Name.Should().Be("Test World");
    }

    [Fact]
    public async Task GetWorldByIdAsync_WithNonExistentWorld_ReturnsNull() {
        _mockWorldStorage.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns((VttTools.Library.Worlds.Model.World?)null);

        var result = await _sut.GetWorldByIdAsync(Guid.CreateVersion7(), TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateWorldAsync_WithValidData_CreatesWorld() {
        var users = CreateTestUsers(1);
        SetupUserStorageMock(users);

        var result = await _sut.CreateWorldAsync("New World", "Description", TestContext.Current.CancellationToken);

        result.Name.Should().Be("New World");
        result.IsPublished.Should().BeFalse();
        result.OwnerId.Should().Be(_masterUserId);

        await _mockWorldStorage.Received(1).AddAsync(Arg.Any<VttTools.Library.Worlds.Model.World>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateWorldAsync_WithEmptyName_ThrowsArgumentException() {
        var act = () => _sut.CreateWorldAsync("", "Description", default);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    private void SetupUserStorageMock(List<User> users) {
        _mockUserStorage.GetDisplayNamesAsync(Arg.Any<IEnumerable<Guid>>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                var ids = callInfo.Arg<IEnumerable<Guid>>().ToList();
                return users.Where(u => ids.Contains(u.Id))
                    .ToDictionary(u => u.Id, u => (string?)u.DisplayName) as IReadOnlyDictionary<Guid, string?>;
            });
        _mockUserStorage.FindByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => {
                var id = callInfo.Arg<Guid>();
                return users.FirstOrDefault(u => u.Id == id);
            });
    }

    private VttTools.Library.Worlds.Model.World CreateTestWorld(string name, string description, Guid? ownerId = null) => new() {
        Id = Guid.CreateVersion7(),
        OwnerId = ownerId ?? _masterUserId,
        Name = name,
        Description = description,
        IsPublished = false,
        IsPublic = false
    };

    private VttTools.Library.Worlds.Model.World[] CreateTestWorlds(int count) {
        var worlds = new List<VttTools.Library.Worlds.Model.World>();
        for (var i = 0; i < count; i++) {
            worlds.Add(CreateTestWorld($"World {i}", $"Description {i}"));
        }
        return [.. worlds];
    }

    private static User CreateTestUser(Guid id, string email, string name) => new() {
        Id = id,
        Email = email,
        Name = name,
        DisplayName = name
    };

    private static List<User> CreateTestUsers(int count) {
        var users = new List<User>();
        for (var i = 0; i < count; i++) {
            users.Add(CreateTestUser(Guid.CreateVersion7(), $"user{i}@example.com", $"User {i}"));
        }
        return users;
    }
}
