namespace VttTools.Model.Game;

public class MeetingTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var meeting = new Meeting();

        // Assert
        meeting.Id.Should().NotBeEmpty();
        meeting.OwnerId.Should().BeEmpty();
        meeting.Name.Should().BeEmpty();
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
        var meeting = new Meeting {
            Id = Guid.NewGuid(),
            OwnerId = Guid.Empty,
            Name = string.Empty,
            Players = [],
            Messages = [],
            Events = [],
            EpisodeId = Guid.NewGuid(),
        };

        // Assert
        meeting.Id.Should().NotBeEmpty();
        meeting.OwnerId.Should().BeEmpty();
        meeting.Name.Should().BeEmpty();
        meeting.Players.Should().NotBeNull();
        meeting.Players.Should().BeEmpty();
        meeting.EpisodeId.Should().NotBeNull();
        meeting.Messages.Should().NotBeNull();
        meeting.Messages.Should().BeEmpty();
        meeting.Events.Should().NotBeNull();
        meeting.Events.Should().BeEmpty();
    }

    [Fact]
    public void PlayersCollection_WhenAdded_ContainsAddedPlayer() {
        // Arrange
        var meeting = new Meeting();
        var player = new MeetingPlayer {
            UserId = Guid.NewGuid(),
            Type = PlayerType.Player,
        };

        // Act
        meeting.Players.Add(player);

        // Assert
        meeting.Players.Should().ContainSingle();
        meeting.Players.Should().Contain(player);
    }

    [Fact]
    public void MessagesCollection_WhenAdded_ContainsAddedMessage() {
        // Arrange
        var meeting = new Meeting();
        var message = new MeetingMessage {
            SentBy = Guid.NewGuid(),
            Content = "Test message",
            SentAt = DateTime.UtcNow,
        };

        // Act
        meeting.Messages.Add(message);

        // Assert
        meeting.Messages.Should().ContainSingle();
        meeting.Messages.Should().Contain(message);
    }

    [Fact]
    public void EventsCollection_WhenAdded_ContainsAddedEvent() {
        // Arrange
        var meeting = new Meeting();
        var meetingEvent = new MeetingEvent {
            Timestamp = DateTime.UtcNow,
            Description = "Test event",
        };

        // Act
        meeting.Events.Add(meetingEvent);

        // Assert
        meeting.Events.Should().ContainSingle();
        meeting.Events.Should().Contain(meetingEvent);
    }
}