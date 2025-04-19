namespace VttTools.Model.Game;

public class MeetingPlayerTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var player = new MeetingPlayer();

        // Assert
        player.UserId.Should().BeNull();
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
            Type = type
        };

        // Assert
        player.UserId.Should().Be(userId);
        player.Type.Should().Be(type);
    }

    [Fact]
    public void Type_WhenChangedToMaster_UpdatesCorrectly() {
        // Arrange
        var player = new MeetingPlayer {
            Type = PlayerType.Player
        };

        // Act
        player.Type = PlayerType.Master;

        // Assert
        player.Type.Should().Be(PlayerType.Master);
    }

    [Fact]
    public void Type_WhenChangedToPlayer_UpdatesCorrectly() {
        // Arrange
        var player = new MeetingPlayer {
            Type = PlayerType.Master
        };

        // Act
        player.Type = PlayerType.Player;

        // Assert
        player.Type.Should().Be(PlayerType.Player);
    }

    [Fact]
    public void UserId_WhenChanged_UpdatesCorrectly() {
        // Arrange
        var player = new MeetingPlayer();
        var userId = Guid.NewGuid();

        // Act
        player.UserId = userId;

        // Assert
        player.UserId.Should().Be(userId);
    }
}