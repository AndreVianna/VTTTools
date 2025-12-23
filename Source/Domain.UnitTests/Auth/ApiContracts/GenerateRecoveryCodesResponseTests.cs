namespace VttTools.Auth.ApiContracts;

public class GenerateRecoveryCodesResponseTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var response = new GenerateRecoveryCodesResponse();

        // Assert
        response.RecoveryCodes.Should().BeNull();
        response.Success.Should().BeFalse();
        response.Message.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new GenerateRecoveryCodesResponse {
            RecoveryCodes = null,
            Success = false,
            Message = "Original message",
        };
        var recoveryCodes = new[] { "RECOVERY1", "RECOVERY2", "RECOVERY3" };

        // Act
        var updated = original with {
            RecoveryCodes = recoveryCodes,
            Success = true,
            Message = "Updated message",
        };

        // Assert
        updated.RecoveryCodes.Should().BeEquivalentTo(recoveryCodes);
        updated.Success.Should().BeTrue();
        updated.Message.Should().Be("Updated message");
        original.Success.Should().BeFalse();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var recoveryCodes = new[] { "CODE1", "CODE2", "CODE3" };
        var response1 = new GenerateRecoveryCodesResponse {
            RecoveryCodes = recoveryCodes,
            Success = true,
            Message = "Generated",
        };
        var response2 = new GenerateRecoveryCodesResponse {
            RecoveryCodes = recoveryCodes,
            Success = true,
            Message = "Generated",
        };

        // Act & Assert
        response1.Should().Be(response2);
        (response1 == response2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var response1 = new GenerateRecoveryCodesResponse {
            RecoveryCodes = ["CODE1"],
            Success = true,
            Message = "Generated",
        };
        var response2 = new GenerateRecoveryCodesResponse {
            RecoveryCodes = null,
            Success = false,
            Message = "Failed",
        };

        // Act & Assert
        response1.Should().NotBe(response2);
        (response1 != response2).Should().BeTrue();
    }
}
