namespace VttTools.Data;

public class ApplicationDbContextTests : IDisposable {
    private readonly ApplicationDbContext _context;

    public ApplicationDbContextTests() {
        var dbName = $"AppDbTestDb_{Guid.NewGuid()}";
        _context = DbContextHelper.CreateInMemoryContext(dbName);
    }

    public void Dispose() {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public void DbContext_HasRequiredDbSets() {
        // Assert
        var properties = typeof(ApplicationDbContext).GetProperties()
            .Where(p => p.PropertyType.IsGenericType &&
                        p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>))
            .ToList();

        // Check for essential DbSets
        properties.Should().Contain(p => p.Name == "Adventures");
        properties.Should().Contain(p => p.Name == "Episodes");
        properties.Should().Contain(p => p.Name == "Assets");
        properties.Should().Contain(p => p.Name == "Meetings");

        // Check for identity DbSets via base class
        properties.Should().Contain(p => p.Name == "Users");
        properties.Should().Contain(p => p.Name == "Roles");
    }

    [Fact]
    public async Task DbContext_CanSaveAndRetrieveEntities() {
        // Arrange
        var adventure = DbContextHelper.CreateTestAdventure(name: "Test Adventure");
        var episode = DbContextHelper.CreateTestEpisode(name: "Test Episode", parentId: adventure.Id);
        var asset = DbContextHelper.CreateTestAsset(name: "Test Asset");
        var meeting = DbContextHelper.CreateTestMeeting(subject: "Test Meeting");

        // Act
        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.Episodes.AddAsync(episode, TestContext.Current.CancellationToken);
        await _context.Assets.AddAsync(asset, TestContext.Current.CancellationToken);
        await _context.Meetings.AddAsync(meeting, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Clear tracking to ensure we get fresh entities from DB
        _context.ChangeTracker.Clear();

        // Assert
        var savedAdventure = await _context.Adventures.FindAsync([ adventure.Id ], TestContext.Current.CancellationToken);
        savedAdventure.Should().NotBeNull();
        savedAdventure.Name.Should().Be("Test Adventure");

        var savedEpisode = await _context.Episodes.FindAsync([ episode.Id ], TestContext.Current.CancellationToken);
        savedEpisode.Should().NotBeNull();
        savedEpisode.Name.Should().Be("Test Episode");
        savedEpisode.ParentId.Should().Be(adventure.Id);

        var savedAsset = await _context.Assets.FindAsync([ asset.Id ], TestContext.Current.CancellationToken);
        savedAsset.Should().NotBeNull();
        savedAsset.Name.Should().Be("Test Asset");

        var savedMeeting = await _context.Meetings.FindAsync([ meeting.Id ], TestContext.Current.CancellationToken);
        savedMeeting.Should().NotBeNull();
        savedMeeting.Subject.Should().Be("Test Meeting");
    }

    [Fact]
    public async Task DbContext_HandlesRelationships_BetweenAdventuresAndEpisodes() {
        // Arrange
        var adventure = DbContextHelper.CreateTestAdventure(name: "Adventure with Episodes");
        var episode1 = DbContextHelper.CreateTestEpisode(name: "Episode 1", parentId: adventure.Id);
        var episode2 = DbContextHelper.CreateTestEpisode(name: "Episode 2", parentId: adventure.Id);

        // Act
        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.Episodes.AddRangeAsync(episode1, episode2);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Clear tracking
        _context.ChangeTracker.Clear();

        // Assert - Check relationship via Include
        var retrievedAdventure = await _context.Adventures
            .Include(a => a.Episodes)
            .FirstOrDefaultAsync(a => a.Id == adventure.Id, cancellationToken: TestContext.Current.CancellationToken);

        retrievedAdventure.Should().NotBeNull();
        retrievedAdventure.Episodes.Should().HaveCount(2);
        retrievedAdventure.Episodes.Should().Contain(e => e.Name == "Episode 1");
        retrievedAdventure.Episodes.Should().Contain(e => e.Name == "Episode 2");

        // Assert - Check relationship via navigation property
        var retrievedEpisode = await _context.Episodes
            .Include(e => e.Adventure)
            .FirstOrDefaultAsync(e => e.Id == episode1.Id, cancellationToken: TestContext.Current.CancellationToken);

        retrievedEpisode.Should().NotBeNull();
        retrievedEpisode.Adventure.Should().NotBeNull();
        retrievedEpisode.Adventure.Id.Should().Be(adventure.Id);
        retrievedEpisode.Adventure.Name.Should().Be("Adventure with Episodes");
    }

    [Fact]
    public async Task DbContext_HandlesRelationships_BetweenMeetingsAndPlayers() {
        // Arrange
        var meeting = DbContextHelper.CreateTestMeeting(subject: "Meeting with Players");
        var player1 = new MeetingPlayer {
            UserId = Guid.NewGuid(),
                                        };
        var player2 = new MeetingPlayer {
            UserId = Guid.NewGuid(),
                                        };

        meeting.Players.Add(player1);
        meeting.Players.Add(player2);

        // Act
        await _context.Meetings.AddAsync(meeting, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Clear tracking
        _context.ChangeTracker.Clear();

        // Assert
        var retrievedMeeting = await _context.Meetings
            .Include(m => m.Players)
            .FirstOrDefaultAsync(m => m.Id == meeting.Id, cancellationToken: TestContext.Current.CancellationToken);

        retrievedMeeting.Should().NotBeNull();
        retrievedMeeting.Players.Should().HaveCount(2);
        retrievedMeeting.Players.Should().Contain(p => p.UserId == player1.UserId);
        retrievedMeeting.Players.Should().Contain(p => p.UserId == player2.UserId);
    }

    [Fact]
    public async Task DbContext_CascadeDelete_DeletesChildEpisodesWhenAdventureIsDeleted() {
        // Arrange
        var adventure = DbContextHelper.CreateTestAdventure();
        var episode1 = DbContextHelper.CreateTestEpisode(parentId: adventure.Id);
        var episode2 = DbContextHelper.CreateTestEpisode(parentId: adventure.Id);

        await _context.Adventures.AddAsync(adventure, TestContext.Current.CancellationToken);
        await _context.Episodes.AddRangeAsync(episode1, episode2);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Verify episodes exist
        var episodesBefore = await _context.Episodes.CountAsync(cancellationToken: TestContext.Current.CancellationToken);
        episodesBefore.Should().Be(2);

        // Act - Delete the adventure
        _context.Adventures.Remove(adventure);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Assert - Episodes should be deleted
        var episodesAfter = await _context.Episodes.CountAsync(cancellationToken: TestContext.Current.CancellationToken);
        episodesAfter.Should().Be(0);

        var retrievedEpisode1 = await _context.Episodes.FindAsync([ episode1.Id ], TestContext.Current.CancellationToken);
        retrievedEpisode1.Should().BeNull();

        var retrievedEpisode2 = await _context.Episodes.FindAsync([ episode2.Id ], TestContext.Current.CancellationToken);
        retrievedEpisode2.Should().BeNull();
    }

    [Fact]
    public async Task DbContext_CascadeDelete_DeletesPlayersWhenMeetingIsDeleted() {
        // Arrange
        var meeting = DbContextHelper.CreateTestMeeting();
        meeting.Players.Add(new() { UserId = Guid.NewGuid() });
        meeting.Players.Add(new() { UserId = Guid.NewGuid() });

        await _context.Meetings.AddAsync(meeting, TestContext.Current.CancellationToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Verify players exist by counting through the Meeting
        var meetingWithPlayers = await _context.Meetings
            .Include(m => m.Players)
            .FirstAsync(m => m.Id == meeting.Id, cancellationToken: TestContext.Current.CancellationToken);
        meetingWithPlayers.Players.Count.Should().Be(2);

        // Act - Delete the meeting
        _context.Meetings.Remove(meeting);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Assert - Players should be deleted (meeting should be deleted)
        var meetingAfter = await _context.Meetings.FindAsync([ meeting.Id ], TestContext.Current.CancellationToken);
        meetingAfter.Should().BeNull();
    }
}