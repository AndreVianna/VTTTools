namespace VttTools.Data.Game;

public class EpisodeStorageTests : IDisposable {
    private readonly ApplicationDbContext _context;
    private readonly EpisodeStorage _storage;

    public EpisodeStorageTests() {
        var dbName = $"EpisodeTestDb_{Guid.NewGuid()}";
        _context = DbContextHelper.CreateInMemoryContext(dbName);
        _storage = new(_context);
    }

    public void Dispose() {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task GetByParentIdAsync_WithNoEpisodes_ReturnsEmptyArray() {
        // Arrange
        var adventureId = Guid.NewGuid();

        // Act
        var result = await _storage.GetByParentIdAsync(adventureId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByParentIdAsync_WithEpisodes_ReturnsAllEpisodes() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = DbContextHelper.CreateTestAdventure(id: adventureId);

        var episode1 = DbContextHelper.CreateTestEpisode(name: "Episode 1", parentId: adventureId);
        var episode2 = DbContextHelper.CreateTestEpisode(name: "Episode 2", parentId: adventureId);
        // Episode for another adventure
        var otherAdventureId = Guid.NewGuid();
        var otherAdventure = DbContextHelper.CreateTestAdventure(id: otherAdventureId);
        var episode3 = DbContextHelper.CreateTestEpisode(name: "Episode 3", parentId: otherAdventureId);

        await _context.Adventures.AddRangeAsync(adventure, otherAdventure);
        await _context.Episodes.AddRangeAsync(episode1, episode2, episode3);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByParentIdAsync(adventureId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(e => e.Name == "Episode 1");
        result.Should().Contain(e => e.Name == "Episode 2");
        result.Should().NotContain(e => e.Name == "Episode 3");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsEpisode() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = DbContextHelper.CreateTestAdventure(id: adventureId);

        var episodeId = Guid.NewGuid();
        var episode = DbContextHelper.CreateTestEpisode(id: episodeId, name: "Test Episode", parentId: adventureId);

        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.Episodes.AddAsync(episode, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByIdAsync(episodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(episodeId);
        result.Name.Should().Be("Test Episode");
        result.ParentId.Should().Be(adventureId);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull() {
        // Arrange
        var nonExistingId = Guid.NewGuid();

        // Act
        var result = await _storage.GetByIdAsync(nonExistingId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task AddAsync_WithValidEpisode_AddsToDatabase() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = DbContextHelper.CreateTestAdventure(id: adventureId);
        var episode = DbContextHelper.CreateTestEpisode(name: "New Episode", parentId: adventureId);

        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.AddAsync(episode, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(episode.Id);
        result.Name.Should().Be("New Episode");

        // Verify it's in the database
        var dbEpisode = await _context.Episodes.FindAsync([ episode.Id ], TestContext.Current.CancellationToken);
        dbEpisode.Should().NotBeNull();
        dbEpisode.Name.Should().Be("New Episode");
    }

    [Fact]
    public async Task UpdateAsync_WithExistingEpisode_UpdatesInDatabase() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = DbContextHelper.CreateTestAdventure(id: adventureId);
        var episode = DbContextHelper.CreateTestEpisode(name: "Original Name", parentId: adventureId);

        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.Episodes.AddAsync(episode, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Modify the episode
        episode.Name = "Updated Name";

        // Act
        var result = await _storage.UpdateAsync(episode, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Updated Name");

        // Verify it's updated in the database
        var dbEpisode = await _context.Episodes.FindAsync([ episode.Id ], TestContext.Current.CancellationToken);
        dbEpisode.Should().NotBeNull();
        dbEpisode.Name.Should().Be("Updated Name");
    }

    [Fact]
    public async Task DeleteAsync_WithExistingEpisode_RemovesFromDatabase() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = DbContextHelper.CreateTestAdventure(id: adventureId);
        var episode = DbContextHelper.CreateTestEpisode(parentId: adventureId);

        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.Episodes.AddAsync(episode, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        await _storage.DeleteAsync(episode, TestContext.Current.CancellationToken);

        // Assert
        var dbEpisode = await _context.Episodes.FindAsync([ episode.Id ], TestContext.Current.CancellationToken);
        dbEpisode.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_IncludesAdventure_ReturnsEpisodeWithAdventure() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = DbContextHelper.CreateTestAdventure(id: adventureId, name: "Parent Adventure");

        var episodeId = Guid.NewGuid();
        var episode = DbContextHelper.CreateTestEpisode(id: episodeId, parentId: adventureId);

        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.Episodes.AddAsync(episode, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByIdAsync(episodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Adventure.Should().NotBeNull();
        result.Adventure.Id.Should().Be(adventureId);
        result.Adventure.Name.Should().Be("Parent Adventure");
    }
}