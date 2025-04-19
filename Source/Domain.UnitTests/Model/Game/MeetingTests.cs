namespace VttTools.Model.Game;

public class MeetingTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var meeting = new Meeting();

        // Assert
        meeting.Id.Should().NotBeEmpty();
        meeting.OwnerId.Should().BeEmpty();
        meeting.Subject.Should().BeEmpty();
        meeting.Players.Should().NotBeNull();
        meeting.Players.Should().BeEmpty();
        meeting.EpisodeId.Should().BeNull();
        meeting.Messages.Should().NotBeNull();
        meeting.Messages.Should().BeEmpty();
        meeting.Events.Should().NotBeNull();
        meeting.Events.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WhenCalledWithValues_InitializesWithDefaultValues() {
        // Arrange & Act
        var id = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        const string subject = "Some Subject";
        var episodeId = Guid.NewGuid();
        var player = new MeetingPlayer {
            UserId = Guid.NewGuid(),
            Type = PlayerType.Player,
        };
        var message = new MeetingMessage {
            SentBy = Guid.NewGuid(),
            Content = "Test message",
            SentAt = DateTime.UtcNow,
        };
        var @event = new MeetingEvent {
            Timestamp = DateTime.UtcNow,
            Description = "Test event",
        };
        var meeting = new Meeting {
            Id = id,
            OwnerId = ownerId,
            Subject = subject,
            EpisodeId = episodeId,
            Players = [player],
            Messages = [message],
            Events = [@event],
        };

        // Assert
        meeting.Id.Should().Be(id);
        meeting.OwnerId.Should().Be(ownerId);
        meeting.Subject.Should().Be(subject);
        meeting.EpisodeId.Should().Be(episodeId);
        meeting.Players.Should().ContainSingle(p => p.Equals(player));
        meeting.Messages.Should().Contain(p => p.Equals(message));
        meeting.Events.Should().Contain(e => e.Equals(@event));
    }
}