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

        // Act
        var message = new MeetingMessage {
            SentAt = sentAt,
            SentBy = sentBy,
            SentTo = sentTo,
            Content = content
        };

        // Assert
        message.SentAt.Should().Be(sentAt);
        message.SentBy.Should().Be(sentBy);
        message.SentTo.Should().BeEquivalentTo(sentTo);
        message.Content.Should().Be(content);
    }

    [Fact]
    public void SentTo_WhenEmpty_RepresentsGroupMessage() {
        // Arrange & Act
        var message = new MeetingMessage {
            SentBy = Guid.NewGuid(),
            SentTo = [],
            Content = "This is a group message"
        };

        // Assert
        message.SentTo.Should().BeEmpty();
    }

    [Fact]
    public void Content_WithLongText_StoresCompleteText() {
        // Arrange
        var longMessage = new string('A', 2000) + new string('B', 2000);

        // Act
        var message = new MeetingMessage {
            Content = longMessage
        };

        // Assert
        message.Content.Should().Be(longMessage);
        message.Content.Length.Should().Be(4000);
    }

    [Fact]
    public void Properties_WhenChanged_UpdateCorrectly() {
        // Arrange
        var message = new MeetingMessage();
        var sentAt = DateTime.UtcNow.AddMinutes(-10);
        var sentBy = Guid.NewGuid();
        var sentTo = new[] { Guid.NewGuid(), Guid.NewGuid() };
        const string content = "Updated content";

        // Act
        message.SentAt = sentAt;
        message.SentBy = sentBy;
        message.SentTo = sentTo;
        message.Content = content;

        // Assert
        message.SentAt.Should().Be(sentAt);
        message.SentBy.Should().Be(sentBy);
        message.SentTo.Should().BeEquivalentTo(sentTo);
        message.Content.Should().Be(content);
    }

    [Fact]
    public void Type_EnumValues_WorkCorrectly() {
        // Arrange
        var message = new MeetingMessage {
            // Act & Assert - Test all content types
            Type = ContentType.Text
        };
        message.Type.Should().Be(ContentType.Text);

        message.Type = ContentType.Command;
        message.Type.Should().Be(ContentType.Command);
    }
}