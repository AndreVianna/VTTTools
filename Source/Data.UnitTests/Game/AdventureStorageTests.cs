namespace VttTools.Data.Game;

public class AdventureStorageTests : IDisposable {
    private readonly ApplicationDbContext _context;
    private readonly AdventureStorage _storage;

    public AdventureStorageTests() {
        var dbName = $"AdventureTestDb_{Guid.NewGuid()}";
        _context = DbContextHelper.CreateInMemoryContext(dbName);
        _storage = new(_context);
    }

    public void Dispose() {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task GetAllAsync_WithNoAdventures_ReturnsEmptyArray() {
        // Arrange

        // Act
        var result = await _storage.GetAllAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_WithAdventures_ReturnsAllAdventures() {
        // Arrange
        var adventure1 = DbContextHelper.CreateTestAdventure(name: "Adventure 1");
        var adventure2 = DbContextHelper.CreateTestAdventure(name: "Adventure 2");

        await _context.Adventures.AddRangeAsync([adventure1, adventure2], TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetAllAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(a => a.Name == "Adventure 1");
        result.Should().Contain(a => a.Name == "Adventure 2");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsAdventure() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = DbContextHelper.CreateTestAdventure(id: adventureId, name: "Test Adventure");

        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByIdAsync(adventureId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(adventureId);
        result.Name.Should().Be("Test Adventure");
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
    public async Task AddAsync_WithValidAdventure_AddsToDatabase() {
        // Arrange
        var adventure = DbContextHelper.CreateTestAdventure(name: "New Adventure");

        // Act
        var result = await _storage.AddAsync(adventure, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(adventure.Id);

        // Verify it's in the database
        var dbAdventure = await _context.Adventures.FindAsync([adventure.Id], TestContext.Current.CancellationToken);
        dbAdventure.Should().NotBeNull();
        dbAdventure.Name.Should().Be("New Adventure");
    }

    [Fact]
    public async Task UpdateAsync_WithExistingAdventure_UpdatesInDatabase() {
        // Arrange
        var adventure = DbContextHelper.CreateTestAdventure(name: "Original Name");

        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Modify the adventure
        adventure.Name = "Updated Name";

        // Act
        var result = await _storage.UpdateAsync(adventure, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Updated Name");

        // Verify it's updated in the database
        var dbAdventure = await _context.Adventures.FindAsync([adventure.Id], TestContext.Current.CancellationToken);
        dbAdventure.Should().NotBeNull();
        dbAdventure.Name.Should().Be("Updated Name");
    }

    [Fact]
    public async Task DeleteAsync_WithExistingAdventure_RemovesFromDatabase() {
        // Arrange
        var adventure = DbContextHelper.CreateTestAdventure();

        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        await _storage.DeleteAsync(adventure, TestContext.Current.CancellationToken);

        // Assert
        var dbAdventure = await _context.Adventures.FindAsync([adventure.Id], TestContext.Current.CancellationToken);
        dbAdventure.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_IncludesEpisodes_WhenAdventureHasEpisodes() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var adventure = DbContextHelper.CreateTestAdventure(id: adventureId);

        var episode1 = DbContextHelper.CreateTestEpisode(name: "Episode 1", parentId: adventureId);
        var episode2 = DbContextHelper.CreateTestEpisode(name: "Episode 2", parentId: adventureId);

        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.Episodes.AddRangeAsync(episode1, episode2);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByIdAsync(adventureId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Episodes.Should().HaveCount(2);
        result.Episodes.Should().Contain(e => e.Name == "Episode 1");
        result.Episodes.Should().Contain(e => e.Name == "Episode 2");
    }
}