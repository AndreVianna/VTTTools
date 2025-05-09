namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageHandlerTests
    : ComponentTestContext {
    private readonly IEmailSender<User> _emailSender = Substitute.For<IEmailSender<User>>();

    public EmailPageHandlerTests() {
        Services.AddScoped<IEmailSender<User>>(_ => _emailSender);
        EnsureAuthenticated();
    }

    [Fact]
    public void WhenConfigured_EmailInputIsNull() {
        // Arrange
        var handler = CreateHandler(isConfigured: false);

        // Act
        handler.Configure();

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
        if (isAuthorized)
            EnsureAuthenticated();
        var page = Substitute.For<IAccountPage>();
        page.CurrentUser.Returns(CurrentUser);
        page.HttpContext.Returns(HttpContext);
        page.NavigationManager.Returns(NavigationManager);
        page.Logger.Returns(NullLogger.Instance);
        var handler = new EmailPageHandler(page);
        if (isConfigured)
            handler.Configure();
        return handler;
    }
}