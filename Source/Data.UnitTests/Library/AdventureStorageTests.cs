namespace VttTools.Data.Library;

public class AdventureStorageTests
    : IDisposable {
    private readonly AdventureStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly CancellationToken _ct;

    public AdventureStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(Guid.NewGuid());
        var loggerFactory = NullLoggerFactory.Instance;
        _storage = new(_context, loggerFactory);
#if XUNITV3
        _ct = TestContext.Current.CancellationToken;
#else
        _ct = CancellationToken.None;
#endif
    }

    public void Dispose() {
        DbContextHelper.Dispose(_context);
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllAdventures() {
        // Act
        var result = await _storage.GetAllAsync(_ct);

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(a => a.Name == "Adventure 1");
        result.Should().Contain(a => a.Name == "Adventure 2");
        result.Should().Contain(a => a.Name == "Adventure 3");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsAdventure() {
        // Act
        var result = await _storage.GetByIdAsync(_context.Adventures.First().Id, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(_context.Adventures.First().Id);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNull() {
        // Arrange
        var nonExistingId = Guid.NewGuid();

        // Act
        var result = await _storage.GetByIdAsync(nonExistingId, _ct);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task AddAsync_WithValidAdventure_AddsToDatabase() {
        // Arrange
        var adventure = DbContextHelper.CreateTestAdventure("New Adventure");

        // Act
        await _storage.AddAsync(adventure, _ct);

        // Assert
        var storedAdventure = await _context.Adventures.FindAsync([adventure.Id], _ct);
        storedAdventure.Should().BeEquivalentTo(adventure);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingAdventure_UpdatesInDatabase() {
        // Arrange
        var adventure = DbContextHelper.CreateTestAdventure("Adventure To Update");
        await _context.Adventures.AddAsync(adventure, _ct);
        await _context.SaveChangesAsync(_ct);
        adventure.Name = "Updated Name";

        // Act
        await _storage.UpdateAsync(adventure, _ct);

        // Assert
        var storedAdventure = await _context.Adventures.FindAsync([adventure.Id], _ct);
        storedAdventure.Should().BeEquivalentTo(adventure);
    }

    [Fact]
    public async Task DeleteAsync_WithExistingAdventure_RemovesFromDatabase() {
        // Arrange
        var adventure = DbContextHelper.CreateTestAdventure("Adventure To Delete");
        await _context.Adventures.AddAsync(adventure, _ct);
        await _context.SaveChangesAsync(_ct);

        // Act
        await _storage.DeleteAsync(adventure.Id, _ct);

        // Assert
        var dbAdventure = await _context.Adventures.FindAsync([adventure.Id], _ct);
        dbAdventure.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_IncludesScenes_WhenAdventureHasScenes() {
        // Arrange
        var adventureId = _context.Adventures.First(p => p.Name == "Adventure 1").Id;

        // Act
        var result = await _storage.GetByIdAsync(adventureId, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Scenes.Should().HaveCount(2);
        result.Scenes.Should().Contain(e => e.Name == "Scene 1.1");
        result.Scenes.Should().Contain(e => e.Name == "Scene 1.2");
    }
}