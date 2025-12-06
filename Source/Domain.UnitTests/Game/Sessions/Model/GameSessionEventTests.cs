namespace VttTools.Game.Sessions.Model;

public class GameSessionEventTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var sessionEvent = new GameSessionEvent();

        // Assert
        sessionEvent.Timestamp.Should().Be(default);
        sessionEvent.Description.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var timestamp = DateTime.UtcNow.AddMinutes(-5);
        const string description = "Player joined the game";

        // Act
        var sessionEvent = new GameSessionEvent {
            Timestamp = timestamp,
            Description = description
        };

        // Assert
        sessionEvent.Timestamp.Should().Be(timestamp);
        sessionEvent.Description.Should().Be(description);
    }
}