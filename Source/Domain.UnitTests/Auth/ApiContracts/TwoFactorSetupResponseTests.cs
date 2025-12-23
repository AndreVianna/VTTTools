namespace VttTools.Auth.ApiContracts;

public class TwoFactorSetupResponseTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var response = new TwoFactorSetupResponse();

        // Assert
        response.SharedKey.Should().Be(string.Empty);
        response.AuthenticatorUri.Should().Be(string.Empty);
        response.Success.Should().BeFalse();
        response.Message.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new TwoFactorSetupResponse {
            SharedKey = "old-key",
            AuthenticatorUri = "old-uri",
            Success = false,
            Message = "Old message",
        };

        // Act
        var updated = original with {
            SharedKey = "new-key",
            AuthenticatorUri = "new-uri",
            Success = true,
            Message = "New message",
        };

        // Assert
        updated.SharedKey.Should().Be("new-key");
        updated.AuthenticatorUri.Should().Be("new-uri");
        updated.Success.Should().BeTrue();
        updated.Message.Should().Be("New message");
        original.SharedKey.Should().Be("old-key");
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var response1 = new TwoFactorSetupResponse {
            SharedKey = "shared-key-123",
            AuthenticatorUri = "otpauth://totp/VTTTools",
            Success = true,
            Message = "Setup complete",
        };
        var response2 = new TwoFactorSetupResponse {
            SharedKey = "shared-key-123",
            AuthenticatorUri = "otpauth://totp/VTTTools",
            Success = true,
            Message = "Setup complete",
        };

        // Act & Assert
        response1.Should().Be(response2);
        (response1 == response2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var response1 = new TwoFactorSetupResponse {
            SharedKey = "shared-key-123",
            AuthenticatorUri = "otpauth://totp/VTTTools",
            Success = true,
            Message = "Setup complete",
        };
        var response2 = new TwoFactorSetupResponse {
            SharedKey = "different-key",
            AuthenticatorUri = "otpauth://totp/VTTTools",
            Success = true,
            Message = "Setup complete",
        };

        // Act & Assert
        response1.Should().NotBe(response2);
        (response1 != response2).Should().BeTrue();
    }
}
