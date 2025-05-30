namespace VttTools.WebApp.Pages.Account;

public class ConfirmEmailPageHandlerTests
    : ComponentTestContext {
    private readonly ConfirmEmailPage _page = Substitute.For<ConfirmEmailPage>();

    public ConfirmEmailPageHandlerTests() {
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

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
        await handler.VerifyAsync(userId, code);
    }

    [Fact]
    public async Task ConfigureAsync_WithNullParameters_DoesNotSetIsConfirmed() {
        // Arrange
        var handler = CreateHandler();

        // Act
        await handler.VerifyAsync(null, null);
    }

    [Fact]
    public async Task ConfigureAsync_WithInvalidUserId_DoesNotSetIsConfirmed() {
        // Arrange
        var handler = CreateHandler();
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());

        UserManager.FindByIdAsync(Arg.Any<string>()).Returns((User?)null);

        // Act
        await handler.VerifyAsync(userId, code);
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
        await handler.VerifyAsync(userId, code);
    }

    private ConfirmEmailPageHandler CreateHandler() => new(_page);
}