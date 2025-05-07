namespace VttTools.WebApp.Pages.Account;

public class ForgotPasswordPageHandlerTests
    : WebAppTestContext {
    private readonly IEmailSender<User> _emailSender = Substitute.For<IEmailSender<User>>();

    [Fact]
    public async Task RequestPasswordResetAsync_WithNonExistentEmail_RedirectsToConfirmationPage() {
        // Arrange
        var handler = CreateHandler();
        handler.State.Input.Email = "nonexistent@example.com";
        UserManager.FindByEmailAsync("nonexistent@example.com").Returns((User?)null);

        // Act
        await handler.RequestPasswordResetAsync();

        // Assert
        NavigationManager.History.Should().ContainSingle(l => l.Uri == "account/forgot_password_confirmation");
        await _emailSender.DidNotReceive().SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task RequestPasswordResetAsync_WithUnconfirmedEmail_RedirectsToConfirmationPage() {
        // Arrange
        var handler = CreateHandler();
        handler.State.Input.Email = "unconfirmed@example.com";

        var user = new User { Email = "unconfirmed@example.com" };
        UserManager.FindByEmailAsync("unconfirmed@example.com").Returns(user);
        UserManager.IsEmailConfirmedAsync(user).Returns(false);

        // Act
        await handler.RequestPasswordResetAsync();

        // Assert
        NavigationManager.History.Should().ContainSingle(l => l.Uri == "account/forgot_password_confirmation");
        await _emailSender.DidNotReceive().SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task RequestPasswordResetAsync_WithValidEmail_SendsResetLinkAndRedirects() {
        // Arrange
        var handler = CreateHandler();
        handler.State.Input.Email = "valid@example.com";

        var user = new User { Email = "valid@example.com" };
        UserManager.FindByEmailAsync("valid@example.com").Returns(user);
        UserManager.IsEmailConfirmedAsync(user).Returns(true);
        UserManager.GeneratePasswordResetTokenAsync(user).Returns("ResetToken");

        // Act
        await handler.RequestPasswordResetAsync();

        // Assert
        NavigationManager.History.Should().ContainSingle(l => l.Uri == "account/forgot_password_confirmation");
        await _emailSender.Received(1).SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    private ForgotPasswordPageHandler CreateHandler(bool isConfigured = true) {
        var handler = new ForgotPasswordPageHandler(HttpContext, NavigationManager, NullLoggerFactory.Instance);
        if (isConfigured)
            handler.Configure(UserManager, _emailSender);
        return handler;
    }
}