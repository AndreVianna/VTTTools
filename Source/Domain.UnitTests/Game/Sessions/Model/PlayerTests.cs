namespace VttTools.Game.Sessions.Model;

public class PlayerTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var player = new Participant();

        // Assert
        player.UserId.Should().BeEmpty();
        player.Type.Should().Be(PlayerType.Guest); // Open is Guest (0)
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var userId = Guid.CreateVersion7();
        const PlayerType type = PlayerType.Master;

        // Act
        var player = new Participant {
            UserId = userId,
            Type = type,
        };

        // Assert
        player.UserId.Should().Be(userId);
        player.Type.Should().Be(type);
    }
}