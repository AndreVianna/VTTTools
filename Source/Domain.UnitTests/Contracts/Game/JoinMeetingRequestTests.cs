namespace VttTools.Contracts.Game;

public class JoinMeetingRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new JoinMeetingRequest {
            JoinAs = PlayerType.Assistant,
        };
        const PlayerType type = PlayerType.Master;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            JoinAs = type,
        };

        // Assert
        data.JoinAs.Should().Be(type);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new JoinMeetingRequest {
            JoinAs = PlayerType.Player,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}