namespace VttTools.Auth.ApiContracts;

public class LoginRequestTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var request = new LoginRequest();

        // Assert
        request.Email.Should().Be(string.Empty);
        request.Password.Should().Be(string.Empty);
        request.RememberMe.Should().BeFalse();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new LoginRequest {
            Email = "old@example.com",
            Password = "oldpassword",
            RememberMe = false,
        };

        // Act
        var updated = original with {
            Email = "new@example.com",
            Password = "newpassword",
            RememberMe = true,
        };

        // Assert
        updated.Email.Should().Be("new@example.com");
        updated.Password.Should().Be("newpassword");
        updated.RememberMe.Should().BeTrue();
        original.Email.Should().Be("old@example.com");
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var request1 = new LoginRequest {
            Email = "test@example.com",
            Password = "password123",
            RememberMe = true,
        };
        var request2 = new LoginRequest {
            Email = "test@example.com",
            Password = "password123",
            RememberMe = true,
        };

        // Act & Assert
        request1.Should().Be(request2);
        (request1 == request2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var request1 = new LoginRequest {
            Email = "test@example.com",
            Password = "password123",
            RememberMe = true,
        };
        var request2 = new LoginRequest {
            Email = "different@example.com",
            Password = "password123",
            RememberMe = true,
        };

        // Act & Assert
        request1.Should().NotBe(request2);
        (request1 != request2).Should().BeTrue();
    }
}
