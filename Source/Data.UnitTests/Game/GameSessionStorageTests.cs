namespace VttTools.Data.Game;

public class GameSessionStorageTests
    : IDisposable {
    private readonly GameSessionStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly Guid _currentUserId = Guid.NewGuid();
    private readonly CancellationToken _ct;

    public GameSessionStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(_currentUserId);
        _storage = new(_context);
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
    public async Task GetAllAsync_ReturnsAllGameSessions() {
        // Act
        var result = await _storage.GetAllAsync(_ct);

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(m => m.Title == "Session 1");
        result.Should().Contain(m => m.Title == "Session 2");
        result.Should().Contain(m => m.Title == "Session 3");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsGameSession() {
        // Arrange
        var sessionId = _context.GameSessions.First().Id;

        // Act
        var result = await _storage.GetByIdAsync(sessionId, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(sessionId);
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
    public async Task GetByUserIdAsync_WhenUserIsOwner_ReturnsGameSessions() {
        // Act
        var result = await _storage.GetByUserIdAsync(_currentUserId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(m => m.Title == "Session 1");
        result.Should().Contain(m => m.Title == "Session 2");
        result.Should().NotContain(m => m.Title == "Session 3");
    }

    [Fact]
    public async Task GetByUserIdAsync_WhenUserIsPlayer_ReturnsGameSessions() {
        // Arrange
        var session = _context.GameSessions.First(p => p.Title == "Session 1");
        var playerId = session.Players.First(p => p.Type == PlayerType.Player).UserId;

        // Act
        var result = await _storage.GetByUserIdAsync(playerId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(m => m.Title == "Session 1");
        result.Should().Contain(m => m.Title == "Session 2");
        result.Should().NotContain(m => m.Title == "Session 3");
    }

    [Fact]
    public async Task GetByUserIdAsync_WithNoMatchingGameSessions_ReturnsEmptyArray() {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var result = await _storage.GetByUserIdAsync(userId, _ct);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task AddAsync_WithValidGameSession_AddsToDatabase() {
        // Arrange
        var session = DbContextHelper.CreateTestGameSession("New GameSession");

        // Act
        var result = await _storage.AddAsync(session, _ct);

        // Assert
        result.Should().BeEquivalentTo(session);
        var dbGameSession = await _context.GameSessions.FindAsync([session.Id], _ct);
        dbGameSession.Should().BeEquivalentTo(session);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingGameSession_UpdatesInDatabase() {
        // Arrange
        var entity = DbContextHelper.CreateTestGameSessionEntity("Session To Update");

        await _context.GameSessions.AddAsync(entity, _ct);
        await _context.SaveChangesAsync(_ct);

        // Modify the game session
        var session = new GameSession {
            Id = entity.Id,
            Title = "Updated GameSession",
            Status = GameSessionStatus.Scheduled,
            Players = [.. entity.Players],
            OwnerId = entity.OwnerId,
        };

        // Act
        var result = await _storage.UpdateAsync(session, _ct);

        // Assert
        result.Should().BeEquivalentTo(session);
        var dbGameSession = await _context.GameSessions.FindAsync([session.Id], _ct);
        dbGameSession.Should().BeEquivalentTo(session);
    }

    [Fact]
    public async Task DeleteAsync_WithExistingGameSession_RemovesFromDatabase() {
        // Arrange
        var session = DbContextHelper.CreateTestGameSessionEntity("Session To Delete");
        await _context.GameSessions.AddAsync(session, _ct);
        await _context.SaveChangesAsync(_ct);

        // Act
        await _storage.DeleteAsync(session.Id, _ct);

        // Assert
        var dbGameSession = await _context.GameSessions.FindAsync([session.Id], _ct);
        dbGameSession.Should().BeNull();
    }
}