namespace VttTools.Auth.ApiContracts;

public class ResetPasswordRequestTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var request = new ResetPasswordRequest();

        // Assert
        request.Email.Should().Be(string.Empty);
        request.Token.Should().Be(string.Empty);
        request.NewPassword.Should().Be(string.Empty);
        request.ConfirmPassword.Should().Be(string.Empty);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new ResetPasswordRequest {
            Email = "old@example.com",
            Token = "old-token",
            NewPassword = "oldpass",
            ConfirmPassword = "oldpass",
        };

        // Act
        var updated = original with {
            Email = "new@example.com",
            Token = "new-token",
            NewPassword = "newpass",
            ConfirmPassword = "newpass",
        };

        // Assert
        updated.Email.Should().Be("new@example.com");
        updated.Token.Should().Be("new-token");
        updated.NewPassword.Should().Be("newpass");
        updated.ConfirmPassword.Should().Be("newpass");
        original.Email.Should().Be("old@example.com");
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var request1 = new ResetPasswordRequest {
            Email = "test@example.com",
            Token = "reset-token",
            NewPassword = "newpass123",
            ConfirmPassword = "newpass123",
        };
        var request2 = new ResetPasswordRequest {
            Email = "test@example.com",
            Token = "reset-token",
            NewPassword = "newpass123",
            ConfirmPassword = "newpass123",
        };

        // Act & Assert
        request1.Should().Be(request2);
        (request1 == request2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var request1 = new ResetPasswordRequest {
            Email = "test@example.com",
            Token = "reset-token",
            NewPassword = "newpass123",
            ConfirmPassword = "newpass123",
        };
        var request2 = new ResetPasswordRequest {
            Email = "different@example.com",
            Token = "reset-token",
            NewPassword = "newpass123",
            ConfirmPassword = "newpass123",
        };

        // Act & Assert
        request1.Should().NotBe(request2);
        (request1 != request2).Should().BeTrue();
    }
}