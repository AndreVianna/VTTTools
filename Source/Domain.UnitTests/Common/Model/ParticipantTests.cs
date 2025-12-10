namespace VttTools.Common.Model;

public class ParticipantTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var participant = new Participant();

        // Assert
        participant.UserId.Should().Be(Guid.Empty);
        participant.IsRequired.Should().BeFalse();
        participant.Type.Should().Be(PlayerType.Guest);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var originalUserId = Guid.CreateVersion7();
        var newUserId = Guid.CreateVersion7();
        var original = new Participant {
            UserId = originalUserId,
            IsRequired = false,
            Type = PlayerType.Guest,
        };

        // Act
        var updated = original with {
            UserId = newUserId,
            IsRequired = true,
            Type = PlayerType.Master,
        };

        // Assert
        updated.UserId.Should().Be(newUserId);
        updated.IsRequired.Should().BeTrue();
        updated.Type.Should().Be(PlayerType.Master);
        original.UserId.Should().Be(originalUserId);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var participant1 = new Participant {
            UserId = userId,
            IsRequired = true,
            Type = PlayerType.Player,
        };
        var participant2 = new Participant {
            UserId = userId,
            IsRequired = true,
            Type = PlayerType.Player,
        };

        // Act & Assert
        participant1.Should().Be(participant2);
        (participant1 == participant2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var participant1 = new Participant {
            UserId = Guid.CreateVersion7(),
            IsRequired = true,
            Type = PlayerType.Player,
        };
        var participant2 = new Participant {
            UserId = Guid.CreateVersion7(),
            IsRequired = false,
            Type = PlayerType.Guest,
        };

        // Act & Assert
        participant1.Should().NotBe(participant2);
        (participant1 != participant2).Should().BeTrue();
    }
}
