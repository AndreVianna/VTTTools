namespace VttTools.Auth.ApiContracts;

public class SecuritySettingsResponseTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var response = new SecuritySettingsResponse();

        // Assert
        response.HasPassword.Should().BeFalse();
        response.TwoFactorEnabled.Should().BeFalse();
        response.RecoveryCodesRemaining.Should().Be(0);
        response.Success.Should().BeFalse();
        response.Message.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new SecuritySettingsResponse {
            HasPassword = false,
            TwoFactorEnabled = false,
            RecoveryCodesRemaining = 0,
            Success = false,
            Message = "Original message",
        };

        // Act
        var updated = original with {
            HasPassword = true,
            TwoFactorEnabled = true,
            RecoveryCodesRemaining = 5,
            Success = true,
            Message = "Updated message",
        };

        // Assert
        updated.HasPassword.Should().BeTrue();
        updated.TwoFactorEnabled.Should().BeTrue();
        updated.RecoveryCodesRemaining.Should().Be(5);
        updated.Success.Should().BeTrue();
        updated.Message.Should().Be("Updated message");
        original.HasPassword.Should().BeFalse();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var response1 = new SecuritySettingsResponse {
            HasPassword = true,
            TwoFactorEnabled = true,
            RecoveryCodesRemaining = 3,
            Success = true,
            Message = "Settings loaded",
        };
        var response2 = new SecuritySettingsResponse {
            HasPassword = true,
            TwoFactorEnabled = true,
            RecoveryCodesRemaining = 3,
            Success = true,
            Message = "Settings loaded",
        };

        // Act & Assert
        response1.Should().Be(response2);
        (response1 == response2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var response1 = new SecuritySettingsResponse {
            HasPassword = true,
            TwoFactorEnabled = true,
            RecoveryCodesRemaining = 3,
            Success = true,
            Message = "Settings loaded",
        };
        var response2 = new SecuritySettingsResponse {
            HasPassword = false,
            TwoFactorEnabled = false,
            RecoveryCodesRemaining = 0,
            Success = true,
            Message = "Settings loaded",
        };

        // Act & Assert
        response1.Should().NotBe(response2);
        (response1 != response2).Should().BeTrue();
    }
}
