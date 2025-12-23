namespace VttTools.Identity.Model;

public class UserLoginTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var userLogin = new UserLogin();

        // Assert
        userLogin.LoginProvider.Should().BeNull();
        userLogin.ProviderKey.Should().BeNull();
        userLogin.ProviderDisplayName.Should().BeNull();
        userLogin.UserId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void Constructor_WithValues_InitializesWithProvidedValues() {
        // Arrange
        const string loginProvider = "GoogleProvider";
        const string providerKey = "google-key-123";
        const string providerDisplayName = "Google";
        var userId = Guid.CreateVersion7();

        // Act
        var userLogin = new UserLogin {
            LoginProvider = loginProvider,
            ProviderKey = providerKey,
            ProviderDisplayName = providerDisplayName,
            UserId = userId,
        };

        // Assert
        userLogin.LoginProvider.Should().Be(loginProvider);
        userLogin.ProviderKey.Should().Be(providerKey);
        userLogin.ProviderDisplayName.Should().Be(providerDisplayName);
        userLogin.UserId.Should().Be(userId);
    }
}