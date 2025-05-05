namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageHandlerTests
    : WebAppTestContext {
    private readonly IEmailSender<User> _emailSender = Substitute.For<IEmailSender<User>>();
    public EmailPageHandlerTests() {
        EnsureAuthenticated();
    }

    [Fact]
    public void WhenConfigured_EmailInputIsNull() {
        // Arrange
        var handler = CreateHandler(isConfigured: false);

        // Act
        handler.Configure(UserManager, _emailSender);

        // Assert
        handler.State.ChangeEmailInput.CurrentEmail.Should().Be(CurrentUser!.Email);
        handler.State.ChangeEmailInput.Email.Should().BeNull();
    }

    [Fact]
    public async Task ChangeEmailAsync_WithSameEmail_SetsUnchangedMessage() {
        // Arrange
        var handler = CreateHandler();
        handler.State.ChangeEmailInput.Email = CurrentUser!.Email;

        // Act
        await handler.SendEmailChangeConfirmationAsync();

        // Assert
        await UserManager.DidNotReceive().GenerateChangeEmailTokenAsync(Arg.Any<User>(), Arg.Any<string>());
        HttpContext.Received(1).SetStatusMessage("Your email was not changed.");
    }

    [Fact]
    public async Task ChangeEmailAsync_WithNewEmail_SendsConfirmationEmail() {
        // Arrange
        var handler = CreateHandler();
        handler.State.ChangeEmailInput.Email = "some.email@host.com";

        // Act
        await handler.SendEmailChangeConfirmationAsync();

        // Assert
        await UserManager.Received(1).GenerateChangeEmailTokenAsync(Arg.Any<User>(), Arg.Any<string>());
        HttpContext.Received(1).SetStatusMessage("A confirmation link was sent to the new email. Please check your inbox.");
    }

    [Fact]
    public async Task SendEmailVerificationAsync_SendsVerificationEmail() {
        // Arrange
        var handler = CreateHandler();

        // Act
        await handler.SendEmailVerificationAsync();

        // Assert
        await UserManager.Received(1).GenerateEmailConfirmationTokenAsync(Arg.Any<User>());
        HttpContext.Received(1).SetStatusMessage("A confirmation link was sent to the informed email. Please check your inbox.");
    }

    private EmailPageHandler CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized)
            EnsureAuthenticated();
        var handler = new EmailPageHandler(HttpContext, NavigationManager, CurrentUser!, NullLoggerFactory.Instance);
        if (isConfigured)
            handler.Configure(UserManager, _emailSender);
        return handler;
    }
}