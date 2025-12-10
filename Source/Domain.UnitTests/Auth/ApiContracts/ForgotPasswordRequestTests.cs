namespace VttTools.Auth.ApiContracts;

public class ForgotPasswordRequestTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var request = new ForgotPasswordRequest();

        // Assert
        request.Email.Should().Be(string.Empty);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new ForgotPasswordRequest {
            Email = "old@example.com",
        };

        // Act
        var updated = original with {
            Email = "new@example.com",
        };

        // Assert
        updated.Email.Should().Be("new@example.com");
        original.Email.Should().Be("old@example.com");
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var request1 = new ForgotPasswordRequest {
            Email = "test@example.com",
        };
        var request2 = new ForgotPasswordRequest {
            Email = "test@example.com",
        };

        // Act & Assert
        request1.Should().Be(request2);
        (request1 == request2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var request1 = new ForgotPasswordRequest {
            Email = "test@example.com",
        };
        var request2 = new ForgotPasswordRequest {
            Email = "different@example.com",
        };

        // Act & Assert
        request1.Should().NotBe(request2);
        (request1 != request2).Should().BeTrue();
    }
}
