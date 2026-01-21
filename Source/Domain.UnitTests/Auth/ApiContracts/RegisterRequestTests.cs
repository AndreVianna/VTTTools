namespace VttTools.Auth.ApiContracts;

public class RegisterRequestTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var request = new RegisterRequest();

        // Assert
        request.Email.Should().Be(string.Empty);
        request.Password.Should().Be(string.Empty);
        request.ConfirmPassword.Should().Be(string.Empty);
        request.Name.Should().Be(string.Empty);
        request.DisplayName.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new RegisterRequest {
            Email = "old@example.com",
            Password = "oldpass",
            ConfirmPassword = "oldpass",
            Name = "Old Name",
            DisplayName = "OldDisplay",
        };

        // Act
        var updated = original with {
            Email = "new@example.com",
            Password = "newpass",
            ConfirmPassword = "newpass",
            Name = "New Name",
            DisplayName = "NewDisplay",
        };

        // Assert
        updated.Email.Should().Be("new@example.com");
        updated.Password.Should().Be("newpass");
        updated.ConfirmPassword.Should().Be("newpass");
        updated.Name.Should().Be("New Name");
        updated.DisplayName.Should().Be("NewDisplay");
        original.Email.Should().Be("old@example.com");
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var request1 = new RegisterRequest {
            Email = "test@example.com",
            Password = "password123",
            ConfirmPassword = "password123",
            Name = "Test User",
            DisplayName = "TestDisplay",
        };
        var request2 = new RegisterRequest {
            Email = "test@example.com",
            Password = "password123",
            ConfirmPassword = "password123",
            Name = "Test User",
            DisplayName = "TestDisplay",
        };

        // Act & Assert
        request1.Should().Be(request2);
        (request1 == request2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var request1 = new RegisterRequest {
            Email = "test@example.com",
            Password = "password123",
            ConfirmPassword = "password123",
            Name = "Test User",
            DisplayName = "TestDisplay",
        };
        var request2 = new RegisterRequest {
            Email = "different@example.com",
            Password = "password123",
            ConfirmPassword = "password123",
            Name = "Test User",
            DisplayName = "TestDisplay",
        };

        // Act & Assert
        request1.Should().NotBe(request2);
        (request1 != request2).Should().BeTrue();
    }

    [Fact]
    public void Properties_WithNullDisplayName_AcceptsNull() {
        // Arrange & Act
        var request = new RegisterRequest {
            Email = "test@example.com",
            Password = "password123",
            ConfirmPassword = "password123",
            Name = "Test User",
            DisplayName = null,
        };

        // Assert
        request.DisplayName.Should().BeNull();
    }
}