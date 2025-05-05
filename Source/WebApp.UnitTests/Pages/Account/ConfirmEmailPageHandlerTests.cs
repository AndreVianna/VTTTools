namespace VttTools.WebApp.Pages.Account;

public class ConfirmEmailPageHandlerTests
    : WebAppTestContext {
    [Fact]
    public async Task ConfigureAsync_WithValidParameters_ReturnsTrue() {
        // Arrange
        var handler = CreateHandler();
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());
        var user = new User { Id = Guid.Parse(userId), Email = "test@example.com" };

        UserManager.FindByIdAsync(Arg.Any<string>()).Returns(user);
        UserManager.ConfirmEmailAsync(Arg.Any<User>(), Arg.Any<string>()).Returns(IdentityResult.Success);

        // Act
        var result = await handler.ConfigureAsync(UserManager, userId, code);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ConfigureAsync_WithNullParameters_DoesNotSetIsConfirmed() {
        // Arrange
        var handler = CreateHandler();

        // Act
        var result = await handler.ConfigureAsync(UserManager, null, null);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ConfigureAsync_WithInvalidUserId_DoesNotSetIsConfirmed() {
        // Arrange
        var handler = CreateHandler();
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());

        UserManager.FindByIdAsync(Arg.Any<string>()).Returns((User?)null);

        // Act
        var result = await handler.ConfigureAsync(UserManager, userId, code);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ConfigureAsync_WithInvalidCode_DoesNotSetIsConfirmed() {
        // Arrange
        var handler = CreateHandler();
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("InvalidCode"u8.ToArray());
        var user = new User { Id = Guid.Parse(userId), Email = "test@example.com" };

        UserManager.FindByIdAsync(Arg.Any<string>()).Returns(user);
        UserManager.ConfirmEmailAsync(Arg.Any<User>(), Arg.Any<string>()).Returns(IdentityResult.Failed(new IdentityError { Description = "Invalid token." }));

        // Act
        var result = await handler.ConfigureAsync(UserManager, userId, code);

        // Assert
        result.Should().BeFalse();
    }

    private ConfirmEmailPageHandler CreateHandler()
        => new(HttpContext, NavigationManager, NullLoggerFactory.Instance);
}