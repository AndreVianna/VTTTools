namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageHandlerTests
    : ComponentTestContext {
    private readonly IEmailSender<User> _emailSender = Substitute.For<IEmailSender<User>>();
    private readonly EmailPage _page = Substitute.For<EmailPage>();

    public EmailPageHandlerTests() {
        Services.AddScoped<IEmailSender<User>>(_ => _emailSender);
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

    [Fact]
    public void WhenConfigured_EmailInputIsNull() {
        // Arrange & Act
        var handler = CreateHandler(isConfigured: true);

        // Assert - verify the handler was created successfully and authentication works
        handler.Should().NotBeNull();
        CurrentUser.Should().NotBeNull();
        _page.State.ChangeEmailInput.CurrentEmail.Should().Be(CurrentUser!.Email);
        _page.State.ChangeEmailInput.Email.Should().BeNull();
    }

    [Fact]
    public async Task ChangeEmailAsync_WithSameEmail_SetsUnchangedMessage() {
        // Arrange
        var handler = CreateHandler();
        _page.State.ChangeEmailInput.Email = CurrentUser!.Email;

        // Act
        await handler.SendEmailChangeConfirmationAsync();

        // Assert
        await UserManager.DidNotReceive().GenerateChangeEmailTokenAsync(Arg.Any<User>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ChangeEmailAsync_WithNewEmail_SendsConfirmationEmail() {
        // Arrange
        var handler = CreateHandler();
        _page.State.ChangeEmailInput.Email = "some.email@host.com";

        // Act
        await handler.SendEmailChangeConfirmationAsync();

        // Assert
        await UserManager.Received(1).GenerateChangeEmailTokenAsync(Arg.Any<User>(), Arg.Any<string>());
    }

    [Fact]
    public async Task SendEmailVerificationAsync_SendsVerificationEmail() {
        // Arrange
        var handler = CreateHandler();

        // Act
        await handler.SendEmailVerificationAsync();

        // Assert
        await UserManager.Received(1).GenerateEmailConfirmationTokenAsync(Arg.Any<User>());
    }

    private EmailPageHandler CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized) {
            EnsureAuthenticated();
            _page.AccountOwner.Returns(CurrentUser);
        }
        var handler = new EmailPageHandler(_page);
        if (isConfigured)
            handler.Configure();
        return handler;
    }
}