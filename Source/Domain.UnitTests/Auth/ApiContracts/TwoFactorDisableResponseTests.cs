namespace VttTools.Auth.ApiContracts;

public class TwoFactorDisableResponseTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var response = new TwoFactorDisableResponse();

        // Assert
        response.Success.Should().BeFalse();
        response.Message.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new TwoFactorDisableResponse {
            Success = false,
            Message = "Original message",
        };

        // Act
        var updated = original with {
            Success = true,
            Message = "Updated message",
        };

        // Assert
        updated.Success.Should().BeTrue();
        updated.Message.Should().Be("Updated message");
        original.Success.Should().BeFalse();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var response1 = new TwoFactorDisableResponse {
            Success = true,
            Message = "Disabled",
        };
        var response2 = new TwoFactorDisableResponse {
            Success = true,
            Message = "Disabled",
        };

        // Act & Assert
        response1.Should().Be(response2);
        (response1 == response2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var response1 = new TwoFactorDisableResponse {
            Success = true,
            Message = "Disabled",
        };
        var response2 = new TwoFactorDisableResponse {
            Success = false,
            Message = "Failed",
        };

        // Act & Assert
        response1.Should().NotBe(response2);
        (response1 != response2).Should().BeTrue();
    }
}
