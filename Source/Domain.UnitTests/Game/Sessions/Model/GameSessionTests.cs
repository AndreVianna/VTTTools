namespace VttTools.Game.Sessions.Model;

public class GameSessionTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var session = new GameSession();

        // Assert
        session.Id.Should().NotBeEmpty();
        session.OwnerId.Should().BeEmpty();
        session.Title.Should().BeEmpty();
        session.Status.Should().Be(GameSessionStatus.Draft);
        session.Players.Should().NotBeNull();
        session.Players.Should().BeEmpty();
        session.EncounterId.Should().BeNull();
        session.Messages.Should().NotBeNull();
        session.Messages.Should().BeEmpty();
        session.Events.Should().NotBeNull();
        session.Events.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WhenCalledWithValues_InitializesWithDefaultValues() {
        // Arrange & Act
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        const string title = "Some Title";
        const GameSessionStatus status = GameSessionStatus.Scheduled;
        var encounterId = Guid.CreateVersion7();
        var player = new Participant {
            UserId = Guid.CreateVersion7(),
            Type = PlayerType.Player,
        };
        var message = new GameSessionMessage {
            SentBy = Guid.CreateVersion7(),
            Content = "Test message",
            SentAt = DateTime.UtcNow,
        };
        var @event = new GameSessionEvent {
            Timestamp = DateTime.UtcNow,
            Description = "Test event",
        };
        var session = new GameSession {
            Id = id,
            OwnerId = ownerId,
            Title = title,
            Status = status,
            EncounterId = encounterId,
            Players = [player],
            Messages = [message],
            Events = [@event],
        };

        // Assert
        session.Id.Should().Be(id);
        session.OwnerId.Should().Be(ownerId);
        session.Title.Should().Be(title);
        session.Status.Should().Be(status);
        session.EncounterId.Should().Be(encounterId);
        session.Players.Should().ContainSingle(p => p.Equals(player));
        session.Messages.Should().Contain(p => p.Equals(message));
        session.Events.Should().Contain(e => e.Equals(@event));
    }
}