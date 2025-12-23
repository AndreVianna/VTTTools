namespace VttTools.Auth.ApiContracts;

public class AuthResponseTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var response = new AuthResponse();

        // Assert
        response.Success.Should().BeFalse();
        response.Message.Should().BeNull();
        response.User.Should().BeNull();
        response.Token.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var userInfo = new UserInfo {
            Id = Guid.CreateVersion7(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var original = new AuthResponse {
            Success = false,
            Message = "Original message",
            User = null,
            Token = null,
        };

        // Act
        var updated = original with {
            Success = true,
            Message = "Updated message",
            User = userInfo,
            Token = "jwt-token",
        };

        // Assert
        updated.Success.Should().BeTrue();
        updated.Message.Should().Be("Updated message");
        updated.User.Should().Be(userInfo);
        updated.Token.Should().Be("jwt-token");
        original.Success.Should().BeFalse();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var userInfo = new UserInfo {
            Id = Guid.CreateVersion7(),
            Email = "test@example.com",
            Name = "Test User",
        };
        var response1 = new AuthResponse {
            Success = true,
            Message = "Success",
            User = userInfo,
            Token = "jwt-token",
        };
        var response2 = new AuthResponse {
            Success = true,
            Message = "Success",
            User = userInfo,
            Token = "jwt-token",
        };

        // Act & Assert
        response1.Should().Be(response2);
        (response1 == response2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var response1 = new AuthResponse {
            Success = true,
            Message = "Success",
            User = null,
            Token = "jwt-token",
        };
        var response2 = new AuthResponse {
            Success = false,
            Message = "Failed",
            User = null,
            Token = null,
        };

        // Act & Assert
        response1.Should().NotBe(response2);
        (response1 != response2).Should().BeTrue();
    }
}
