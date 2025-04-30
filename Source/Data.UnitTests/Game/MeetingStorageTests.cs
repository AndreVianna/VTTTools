namespace VttTools.Data.Game;

public class MeetingStorageTests
    : IDisposable {
    private readonly MeetingStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly Guid _currentUserId = Guid.NewGuid();
    private readonly CancellationToken _ct;

    public MeetingStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(_currentUserId);
        _storage = new(_context);
        _ct = TestContext.Current.CancellationToken;
    }

    public void Dispose() {
        DbContextHelper.Dispose(_context);
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllMeetings() {
        // Act
        var result = await _storage.GetAllAsync(_ct);

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(m => m.Subject == "Meeting 1");
        result.Should().Contain(m => m.Subject == "Meeting 2");
        result.Should().Contain(m => m.Subject == "Meeting 3");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsMeeting() {
        // Arrange
        var meetingId = _context.Meetings.First().Id;

        // Act
        var result = await _storage.GetByIdAsync(meetingId, _ct);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(meetingId);
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
    public async Task GetByUserIdAsync_WhenUserIsOwner_ReturnsMeetings() {
        // Act
        var result = await _storage.GetByUserIdAsync(_currentUserId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(m => m.Subject == "Meeting 1");
        result.Should().Contain(m => m.Subject == "Meeting 2");
        result.Should().NotContain(m => m.Subject == "Meeting 3");
    }

    [Fact]
    public async Task GetByUserIdAsync_WhenUserIsPlayer_ReturnsMeetings() {
        // Arrange
        var playerId = _context.Meetings.First().Players.First(p => p.Type == PlayerType.Player).UserId;

        // Act
        var result = await _storage.GetByUserIdAsync(playerId, _ct);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(m => m.Subject == "Meeting 1");
        result.Should().Contain(m => m.Subject == "Meeting 2");
        result.Should().NotContain(m => m.Subject == "Meeting 3");
    }

    [Fact]
    public async Task GetByUserIdAsync_WithNoMatchingMeetings_ReturnsEmptyArray() {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var result = await _storage.GetByUserIdAsync(userId, _ct);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task AddAsync_WithValidMeeting_AddsToDatabase() {
        // Arrange
        var meeting = DbContextHelper.CreateTestMeeting("New Meeting");

        // Act
        var result = await _storage.AddAsync(meeting, _ct);

        // Assert
        result.Should().BeEquivalentTo(meeting);
        var dbMeeting = await _context.Meetings.FindAsync([meeting.Id], _ct);
        dbMeeting.Should().BeEquivalentTo(meeting);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingMeeting_UpdatesInDatabase() {
        // Arrange
        var meeting = DbContextHelper.CreateTestMeeting("Meeting To Update");

        await _context.Meetings.AddAsync(meeting, _ct);
        await _context.SaveChangesAsync(_ct);

        // Modify the meeting
        meeting.Subject = "Updated Meeting";
        meeting.Status = MeetingStatus.Cancelled;

        // Act
        var result = await _storage.UpdateAsync(meeting, _ct);

        // Assert
        result.Should().BeEquivalentTo(meeting);
        var dbMeeting = await _context.Meetings.FindAsync([meeting.Id], _ct);
        dbMeeting.Should().BeEquivalentTo(meeting);
    }

    [Fact]
    public async Task DeleteAsync_WithExistingMeeting_RemovesFromDatabase() {
        // Arrange
        var meeting = DbContextHelper.CreateTestMeeting("Meeting To Delete");
        await _context.Meetings.AddAsync(meeting, _ct);
        await _context.SaveChangesAsync(_ct);

        // Act
        await _storage.DeleteAsync(meeting.Id, _ct);

        // Assert
        var dbMeeting = await _context.Meetings.FindAsync([meeting.Id], _ct);
        dbMeeting.Should().BeNull();
    }
}