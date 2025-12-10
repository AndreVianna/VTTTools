namespace VttTools.Auth.ApiContracts;

public class RecoveryCodesStatusResponseTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var response = new RecoveryCodesStatusResponse();

        // Assert
        response.RemainingCount.Should().Be(0);
        response.Success.Should().BeFalse();
        response.Message.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new RecoveryCodesStatusResponse {
            RemainingCount = 0,
            Success = false,
            Message = "Original message",
        };

        // Act
        var updated = original with {
            RemainingCount = 5,
            Success = true,
            Message = "Updated message",
        };

        // Assert
        updated.RemainingCount.Should().Be(5);
        updated.Success.Should().BeTrue();
        updated.Message.Should().Be("Updated message");
        original.RemainingCount.Should().Be(0);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var response1 = new RecoveryCodesStatusResponse {
            RemainingCount = 3,
            Success = true,
            Message = "3 codes remaining",
        };
        var response2 = new RecoveryCodesStatusResponse {
            RemainingCount = 3,
            Success = true,
            Message = "3 codes remaining",
        };

        // Act & Assert
        response1.Should().Be(response2);
        (response1 == response2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var response1 = new RecoveryCodesStatusResponse {
            RemainingCount = 3,
            Success = true,
            Message = "3 codes remaining",
        };
        var response2 = new RecoveryCodesStatusResponse {
            RemainingCount = 5,
            Success = true,
            Message = "5 codes remaining",
        };

        // Act & Assert
        response1.Should().NotBe(response2);
        (response1 != response2).Should().BeTrue();
    }
}
