namespace VttTools.Data.Game;

public class MeetingStorageTests : IDisposable {
    private readonly ApplicationDbContext _context;
    private readonly MeetingStorage _storage;

    public MeetingStorageTests() {
        var dbName = $"MeetingTestDb_{Guid.NewGuid()}";
        _context = DbContextHelper.CreateInMemoryContext(dbName);
        _storage = new(_context);
    }

    public void Dispose() {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task GetAllAsync_WithNoMeetings_ReturnsEmptyArray() {
        // Arrange

        // Act
        var result = await _storage.GetAllAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_WithMeetings_ReturnsAllMeetings() {
        // Arrange
        var meeting1 = DbContextHelper.CreateTestMeeting(subject: "Meeting 1");
        var meeting2 = DbContextHelper.CreateTestMeeting(subject: "Meeting 2");

        await _context.Meetings.AddRangeAsync(meeting1, meeting2);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetAllAsync(TestContext.Current.CancellationToken);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(m => m.Subject == "Meeting 1");
        result.Should().Contain(m => m.Subject == "Meeting 2");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsMeeting() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = DbContextHelper.CreateTestMeeting(id: meetingId, subject: "Test Meeting");

        await _context.Meetings.AddAsync(meeting, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByIdAsync(meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(meetingId);
        result.Subject.Should().Be("Test Meeting");
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
    public async Task GetByUserIdAsync_WhenUserIsOwner_ReturnsMeetings() {
        // Arrange
        var userId = Guid.NewGuid();
        var meeting1 = DbContextHelper.CreateTestMeeting(subject: "Meeting 1", ownerId: userId);
        var meeting2 = DbContextHelper.CreateTestMeeting(subject: "Meeting 2", ownerId: userId);
        var meeting3 = DbContextHelper.CreateTestMeeting(subject: "Meeting 3", ownerId: Guid.NewGuid());

        await _context.Meetings.AddRangeAsync(meeting1, meeting2, meeting3);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByUserIdAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(m => m.Subject == "Meeting 1");
        result.Should().Contain(m => m.Subject == "Meeting 2");
        result.Should().NotContain(m => m.Subject == "Meeting 3");
    }

    [Fact]
    public async Task GetByUserIdAsync_WhenUserIsPlayer_ReturnsMeetings() {
        // Arrange
        var userId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();

        var meeting1 = DbContextHelper.CreateTestMeeting(subject: "Meeting 1", ownerId: ownerId);
        meeting1.Players.Add(new() { UserId = userId });

        var meeting2 = DbContextHelper.CreateTestMeeting(subject: "Meeting 2", ownerId: ownerId);
        meeting2.Players.Add(new() { UserId = userId });

        var meeting3 = DbContextHelper.CreateTestMeeting(subject: "Meeting 3", ownerId: ownerId);
        meeting3.Players.Add(new() { UserId = Guid.NewGuid() });

        await _context.Meetings.AddRangeAsync(meeting1, meeting2, meeting3);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByUserIdAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(m => m.Subject == "Meeting 1");
        result.Should().Contain(m => m.Subject == "Meeting 2");
        result.Should().NotContain(m => m.Subject == "Meeting 3");
    }

    [Fact]
    public async Task GetByUserIdAsync_WhenUserIsOwnerAndPlayer_ReturnsMeetingsWithoutDuplicates() {
        // Arrange
        var userId = Guid.NewGuid();

        var meeting = DbContextHelper.CreateTestMeeting(subject: "Meeting", ownerId: userId);
        meeting.Players.Add(new() { UserId = userId });

        await _context.Meetings.AddAsync(meeting, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByUserIdAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().HaveCount(1);
        result.Should().Contain(m => m.Subject == "Meeting");
    }

    [Fact]
    public async Task GetByUserIdAsync_WithNoMatchingMeetings_ReturnsEmptyArray() {
        // Arrange
        var userId = Guid.NewGuid();
        var meeting = DbContextHelper.CreateTestMeeting(ownerId: Guid.NewGuid());

        await _context.Meetings.AddAsync(meeting, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByUserIdAsync(userId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task AddAsync_WithValidMeeting_AddsToDatabase() {
        // Arrange
        var meeting = DbContextHelper.CreateTestMeeting(subject: "New Meeting");

        // Act
        await _storage.AddAsync(meeting, TestContext.Current.CancellationToken);

        // Assert
        var dbMeeting = await _context.Meetings.FindAsync([meeting.Id], TestContext.Current.CancellationToken);
        dbMeeting.Should().NotBeNull();
        dbMeeting.Subject.Should().Be("New Meeting");
    }

    [Fact]
    public async Task UpdateAsync_WithExistingMeeting_UpdatesInDatabase() {
        // Arrange
        var meeting = DbContextHelper.CreateTestMeeting(subject: "Original Subject");

        await _context.Meetings.AddAsync(meeting, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Modify the meeting
        meeting.Subject = "Updated Subject";

        // Act
        await _storage.UpdateAsync(meeting, TestContext.Current.CancellationToken);

        // Assert
        var dbMeeting = await _context.Meetings.FindAsync([meeting.Id], TestContext.Current.CancellationToken);
        dbMeeting.Should().NotBeNull();
        dbMeeting.Subject.Should().Be("Updated Subject");
    }

    [Fact]
    public async Task UpdateAsync_WithMeetingPlayers_UpdatesPlayersInDatabase() {
        // Create a separate test for this specific scenario
        var testDbName = $"MeetingPlayersTestDb_{Guid.NewGuid()}";
        await using var testContext = DbContextHelper.CreateInMemoryContext(testDbName);
        var testStorage = new MeetingStorage(testContext);

        // Arrange
        var meetingId = Guid.NewGuid();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        // Create initial meeting with player1
        var meeting = DbContextHelper.CreateTestMeeting(id: meetingId, subject: "Initial Meeting");
        meeting.Players.Add(new() { UserId = userId1, Type = PlayerType.Player });

        await testContext.Meetings.AddAsync(meeting, TestContext.Current.CancellationToken);
        await testContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Detach all entities to simulate a new request
        foreach (var entry in testContext.ChangeTracker.Entries()) {
            entry.State = EntityState.Detached;
        }

        // Create new meeting object with updated properties
        var updatedMeeting = new Meeting {
            Id = meetingId,
            Subject = "Updated Meeting",
            OwnerId = meeting.OwnerId,
            EpisodeId = meeting.EpisodeId,
            Players = [new MeetingPlayer { UserId = userId2, Type = PlayerType.Player }],
        };

        // Act
        await testStorage.UpdateAsync(updatedMeeting, TestContext.Current.CancellationToken);

        // Assert
        // Detach all entities again to ensure we're getting fresh data
        foreach (var entry in testContext.ChangeTracker.Entries()) {
            entry.State = EntityState.Detached;
        }

        var dbMeeting = await testContext.Meetings
            .Include(m => m.Players)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == meetingId, cancellationToken: TestContext.Current.CancellationToken);

        dbMeeting.Should().NotBeNull();
        dbMeeting.Subject.Should().Be("Updated Meeting");
        dbMeeting.Players.Should().HaveCount(1);
        dbMeeting.Players.Should().Contain(p => p.UserId == userId2);
        dbMeeting.Players.Should().NotContain(p => p.UserId == userId1);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistingMeeting_ThrowsKeyNotFoundException() {
        // Arrange
        var nonExistingMeeting = DbContextHelper.CreateTestMeeting();

        // Act & Assert
        await _storage.Invoking(s => s.UpdateAsync(nonExistingMeeting))
                      .Should().ThrowAsync<KeyNotFoundException>()
                      .WithMessage($"Meeting with ID {nonExistingMeeting.Id} not found.");
    }

    [Fact]
    public async Task DeleteAsync_WithExistingMeeting_RemovesFromDatabase() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = DbContextHelper.CreateTestMeeting(id: meetingId);

        await _context.Meetings.AddAsync(meeting, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        await _storage.DeleteAsync(meetingId, TestContext.Current.CancellationToken);

        // Assert
        var dbMeeting = await _context.Meetings.FindAsync([meetingId], TestContext.Current.CancellationToken);
        dbMeeting.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingMeeting_ThrowsKeyNotFoundException() {
        // Arrange
        var nonExistingId = Guid.NewGuid();

        // Act & Assert
        await _storage.Invoking(s => s.DeleteAsync(nonExistingId))
                      .Should().ThrowAsync<KeyNotFoundException>()
                      .WithMessage($"Meeting with ID {nonExistingId} not found.");
    }

    [Fact]
    public async Task GetByIdAsync_IncludesPlayers_WhenMeetingHasPlayers() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = DbContextHelper.CreateTestMeeting(id: meetingId);

        var player1 = new MeetingPlayer { UserId = Guid.NewGuid() };
        var player2 = new MeetingPlayer { UserId = Guid.NewGuid() };

        meeting.Players.Add(player1);
        meeting.Players.Add(player2);

        await _context.Meetings.AddAsync(meeting, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _storage.GetByIdAsync(meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Players.Should().HaveCount(2);
        result.Players.Should().Contain(p => p.UserId == player1.UserId);
        result.Players.Should().Contain(p => p.UserId == player2.UserId);
    }
}