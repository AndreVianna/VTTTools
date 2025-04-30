namespace VttTools.Data.Game;

public class EpisodeStorageTests
    : IDisposable {
    private readonly EpisodeStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly CancellationToken _ct;

    public EpisodeStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(Guid.NewGuid());
        _storage = new(_context);
        _ct = TestContext.Current.CancellationToken;
    }

    public void Dispose() {
        DbContextHelper.Dispose(_context);
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllEpisodes() {
        // Act
        var result = await _storage.GetAllAsync(_ct);

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(a => a.Name == "Episode 1.1");
        result.Should().Contain(a => a.Name == "Episode 1.2");
        result.Should().Contain(a => a.Name == "Episode 3.1");
    }

    [Fact]
    public async Task GetByParentIdAsync_WithNoEpisodes_ReturnsEmptyArray() {
        // Arrange
        var adventureId = Guid.NewGuid();

        // Act
        var result = await _storage.GetByParentIdAsync(adventureId, _ct);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByParentIdAsync_WithEpisodes_ReturnsAllEpisodes() {
        // Arrange
        var adventureId = _context.Adventures.First().Id;

        // Act
        var result = await _storage.GetByParentIdAsync(adventureId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(e => e.Name == "Episode 1.1");
        result.Should().Contain(e => e.Name == "Episode 1.2");
        result.Should().NotContain(e => e.Name == "Episode 3.1");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsEpisode() {
        // Arrange
        var episodeId = _context.Episodes.First().Id;

        // Act
        var result = await _storage.GetByIdAsync(episodeId, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(episodeId);
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
    public async Task AddAsync_WithValidEpisode_AddsToDatabase() {
        // Arrange
        var episode = DbContextHelper.CreateTestEpisode(_context.Episodes.Skip(1).First().Id, "New Episode");

        // Act
        var result = await _storage.AddAsync(episode, _ct);

        // Assert
        result.Should().BeEquivalentTo(episode);
        var dbEpisode = await _context.Episodes.FindAsync([episode.Id], _ct);
        dbEpisode.Should().BeEquivalentTo(episode);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingEpisode_UpdatesInDatabase() {
        // Arrange
        var episode = DbContextHelper.CreateTestEpisode(_context.Episodes.Skip(1).First().Id, "Episode To Update");

        await _context.Episodes.AddAsync(episode, _ct);
        await _context.SaveChangesAsync(_ct);

        // Modify the episode
        episode.Name = "Updated Episode";
        episode.Visibility = Visibility.Private;

        // Act
        var result = await _storage.UpdateAsync(episode, _ct);

        // Assert
        result.Should().BeEquivalentTo(episode);
        var dbEpisode = await _context.Episodes.FindAsync([episode.Id], _ct);
        dbEpisode.Should().BeEquivalentTo(episode);
    }

    [Fact]
    public async Task DeleteAsync_WithExistingEpisode_RemovesFromDatabase() {
        // Arrange
        var episode = DbContextHelper.CreateTestEpisode(_context.Episodes.Skip(1).First().Id, "Episode To Delete");
        await _context.Episodes.AddAsync(episode, _ct);
        await _context.SaveChangesAsync(_ct);

        // Act
        await _storage.DeleteAsync(episode.Id, _ct);

        // Assert
        var dbEpisode = await _context.Episodes.FindAsync([episode.Id], _ct);
        dbEpisode.Should().BeNull();
    }
}