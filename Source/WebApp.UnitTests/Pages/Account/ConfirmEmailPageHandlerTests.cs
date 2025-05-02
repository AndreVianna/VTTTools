namespace VttTools.WebApp.Pages.Account;

public class ConfirmEmailPageHandlerTests
    : WebAppTestContext {
    private readonly ConfirmEmailPageHandler _handler = new();
    [Fact]
    public async Task InitializeAsync_WithValidParameters_SetIsConfirmedToTrue() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());
        var user = new User { Id = Guid.Parse(userId), Email = "test@example.com" };

        UserManager.FindByIdAsync(userId).Returns(user);
        UserManager.ConfirmEmailAsync(user, "SomeValidationCode").Returns(IdentityResult.Success);

        // Act
        await _handler.InitializeAsync(UserManager, userId, code);

        // Assert
        _handler.State.IsConfirmed.Should().BeTrue();
    }

    [Fact]
    public async Task InitializeAsync_WithNullParameters_DoesNotSetIsConfirmed() {
        // Act
        await _handler.InitializeAsync(UserManager, null, null);

        // Assert
        _handler.State.IsConfirmed.Should().BeFalse();
    }

    [Fact]
    public async Task InitializeAsync_WithInvalidUserId_DoesNotSetIsConfirmed() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());

        UserManager.FindByIdAsync(userId).Returns((User?)null);

        // Act
        await _handler.InitializeAsync(UserManager, userId, code);

        // Assert
        _handler.State.IsConfirmed.Should().BeFalse();
    }

    [Fact]
    public async Task InitializeAsync_WithInvalidCode_DoesNotSetIsConfirmed() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("InvalidCode"u8.ToArray());
        var user = new User { Id = Guid.Parse(userId), Email = "test@example.com" };

        UserManager.FindByIdAsync(userId).Returns(user);
        UserManager.ConfirmEmailAsync(user, "InvalidCode").Returns(IdentityResult.Failed(new IdentityError { Description = "Invalid token." }));

        // Act
        await _handler.InitializeAsync(UserManager, userId, code);

        // Assert
        _handler.State.IsConfirmed.Should().BeFalse();
    }
}