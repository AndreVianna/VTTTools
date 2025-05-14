namespace VttTools.WebApp.Pages.Account.Manage;

public class ChangePasswordPageHandlerTests
    : ComponentTestContext {
    private readonly ChangePasswordPage _page = Substitute.For<ChangePasswordPage>();

    public ChangePasswordPageHandlerTests() {
        _page.AccountOwner.Returns(CurrentUser);
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

    [Fact]
    public void Configure_WhenUserHasNoPassword_RedirectsToSetPassword() {
        // Arrange
        var handler = CreateHandler(isConfigured: false);
        CurrentUser!.PasswordHash = null;

        // Act
        handler.Configure();

        // Assert
        NavigationManager.History.First().Uri.Should().Be("account/manage/set_password");
    }

    [Fact]
    public async Task ChangePasswordAsync_WithSuccessfulChange_RefreshesSignIn() {
        // Arrange
        var handler = CreateHandler();

        _page.Input.CurrentPassword = "OldPassword123!";
        _page.Input.NewPassword = "NewPassword123!";
        _page.Input.NewPasswordConfirmation = "NewPassword123!";

        UserManager.ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>())
            .Returns(IdentityResult.Success);

        // Act
        await handler.ChangePasswordAsync();

        // Assert
        HttpContext.Received(1).SetStatusMessage("Error: Failed to change the password.");
        await SignInManager.Received(1).RefreshSignInAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task ChangePasswordAsync_WithFailure_SetsErrorMessage() {
        // Arrange
        var handler = CreateHandler();

        _page.Input.CurrentPassword = "OldPassword123!";
        _page.Input.NewPassword = "NewPassword123!";
        _page.Input.NewPasswordConfirmation = "NewPassword123!";

        var errors = new IdentityError[] { new() { Description = "Incorrect password." } };
        UserManager.ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>()).Returns(IdentityResult.Failed(errors));

        // Act
        await handler.ChangePasswordAsync();

        // Assert
        HttpContext.Received(1).SetStatusMessage("Error: Failed to change the password.");
        _page.State.Errors.Should().Contain("Incorrect password.");
        await SignInManager.DidNotReceive().RefreshSignInAsync(Arg.Any<User>());
    }

    private ChangePasswordPageHandler CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized) EnsureAuthenticated();
        var handler = new ChangePasswordPageHandler(_page);
        if (isConfigured) handler.Configure();
        return handler;
    }
}