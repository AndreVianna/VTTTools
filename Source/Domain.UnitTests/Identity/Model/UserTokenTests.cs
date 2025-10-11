namespace VttTools.Identity.Model;

public class UserTokenTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var userToken = new UserToken();

        // Assert
        userToken.UserId.Should().Be(Guid.Empty);
        userToken.LoginProvider.Should().BeNull();
        userToken.Name.Should().BeNull();
        userToken.Value.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        var userId = Guid.CreateVersion7();
        const string loginProvider = "GoogleProvider";
        const string name = "RefreshToken";
        const string value = "token-value-123";

        // Act
        var userToken = new UserToken {
            UserId = userId,
            LoginProvider = loginProvider,
            Name = name,
            Value = value,
        };

        // Assert
        userToken.UserId.Should().Be(userId);
        userToken.LoginProvider.Should().Be(loginProvider);
        userToken.Name.Should().Be(name);
        userToken.Value.Should().Be(value);
    }
}