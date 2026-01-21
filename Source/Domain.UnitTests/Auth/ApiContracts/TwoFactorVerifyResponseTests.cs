namespace VttTools.Auth.ApiContracts;

public class TwoFactorVerifyResponseTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var response = new TwoFactorVerifyResponse();

        // Assert
        response.RecoveryCodes.Should().BeNull();
        response.Success.Should().BeFalse();
        response.Message.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new TwoFactorVerifyResponse {
            RecoveryCodes = null,
            Success = false,
            Message = "Original message",
        };
        var recoveryCodes = new[] { "CODE1", "CODE2", "CODE3" };

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
        var recoveryCodes = new[] { "CODE1", "CODE2" };
        var response1 = new TwoFactorVerifyResponse {
            RecoveryCodes = recoveryCodes,
            Success = true,
            Message = "Success",
        };
        var response2 = new TwoFactorVerifyResponse {
            RecoveryCodes = recoveryCodes,
            Success = true,
            Message = "Success",
        };

        // Act & Assert
        response1.Should().Be(response2);
        (response1 == response2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var response1 = new TwoFactorVerifyResponse {
            RecoveryCodes = ["CODE1"],
            Success = true,
            Message = "Success",
        };
        var response2 = new TwoFactorVerifyResponse {
            RecoveryCodes = null,
            Success = false,
            Message = "Failed",
        };

        // Act & Assert
        response1.Should().NotBe(response2);
        (response1 != response2).Should().BeTrue();
    }
}