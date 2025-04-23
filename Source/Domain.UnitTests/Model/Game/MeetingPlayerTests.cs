namespace VttTools.Model.Game;

public class MeetingPlayerTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var player = new MeetingPlayer();

        // Assert
        player.UserId.Should().BeEmpty();
        player.Type.Should().Be(PlayerType.Guest); // Default is Guest (0)
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var userId = Guid.NewGuid();
        const PlayerType type = PlayerType.Master;

        // Act
        var player = new MeetingPlayer {
            UserId = userId,
            Type = type,
        };

        // Assert
        player.UserId.Should().Be(userId);
        player.Type.Should().Be(type);
    }
}