namespace VttTools.Model.Game;

public class MeetingMessageTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var message = new MeetingMessage();

        // Assert
        message.SentAt.Should().Be(default);
        message.SentBy.Should().BeEmpty();
        message.SentTo.Should().NotBeNull();
        message.SentTo.Should().BeEmpty();
        message.Content.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var sentAt = DateTime.UtcNow.AddMinutes(-5);
        var sentBy = Guid.NewGuid();
        var sentTo = new[] { Guid.NewGuid(), Guid.NewGuid() };
        const string content = "Hello, this is a test message!";
        const MessageType type = MessageType.Text;

        // Act
        var message = new MeetingMessage {
            SentAt = sentAt,
            SentBy = sentBy,
            SentTo = sentTo,
            Content = content,
            Type = type,
        };

        // Assert
        message.SentAt.Should().Be(sentAt);
        message.SentBy.Should().Be(sentBy);
        message.SentTo.Should().BeEquivalentTo(sentTo);
        message.Content.Should().Be(content);
        message.Type.Should().Be(type);
    }
}