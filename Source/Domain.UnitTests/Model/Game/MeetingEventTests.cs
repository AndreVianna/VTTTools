namespace VttTools.Model.Game;

public class MeetingEventTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var meetingEvent = new MeetingEvent();

        // Assert
        meetingEvent.Timestamp.Should().Be(default);
        meetingEvent.Description.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var timestamp = DateTime.UtcNow.AddMinutes(-5);
        const string description = "Player joined the game";

        // Act
        var meetingEvent = new MeetingEvent {
            Timestamp = timestamp,
            Description = description
        };

        // Assert
        meetingEvent.Timestamp.Should().Be(timestamp);
        meetingEvent.Description.Should().Be(description);
    }

    [Fact]
    public void Description_WhenChanged_UpdatesCorrectly() {
        // Arrange
        var meetingEvent = new MeetingEvent {
            Description = "Initial description"
        };

        // Act
        meetingEvent.Description = "Updated description";

        // Assert
        meetingEvent.Description.Should().Be("Updated description");
    }

    [Fact]
    public void Timestamp_WhenChanged_UpdatesCorrectly() {
        // Arrange
        var originalTime = DateTime.UtcNow.AddHours(-1);
        var meetingEvent = new MeetingEvent {
            Timestamp = originalTime
        };

        // Act
        var newTime = DateTime.UtcNow.AddMinutes(-30);
        meetingEvent.Timestamp = newTime;

        // Assert
        meetingEvent.Timestamp.Should().Be(newTime);
    }

    [Fact]
    public void Description_WithLongText_StoresCompleteText() {
        // Arrange
        var longDescription = new string('A', 500) + new string('B', 500);

        // Act
        var meetingEvent = new MeetingEvent {
            Description = longDescription
        };

        // Assert
        meetingEvent.Description.Should().Be(longDescription);
        meetingEvent.Description.Length.Should().Be(1000);
    }
}