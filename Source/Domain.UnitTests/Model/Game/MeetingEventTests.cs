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
}