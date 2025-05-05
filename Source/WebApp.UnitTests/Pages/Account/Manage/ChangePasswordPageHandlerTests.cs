namespace VttTools.WebApp.Pages.Account.Manage;

public class ChangePasswordPageHandlerTests
    : WebAppTestContext {
    public ChangePasswordPageHandlerTests() {
        EnsureAuthenticated();
    }

    [Fact]
    public void Configure_WhenUserHasNoPassword_RedirectsToSetPassword() {
        // Arrange
        var handler = CreateHandler(isConfigured: false);
        CurrentUser!.PasswordHash = null;

        // Act
        handler.Configure(UserManager, SignInManager);

        // Assert
        NavigationManager.History.First().Uri.Should().Be("account/manage/set_password");
    }

    [Fact]
    public async Task ChangePasswordAsync_WithSuccessfulChange_RefreshesSignIn() {
        // Arrange
        var handler = CreateHandler();

        handler.State.Input.CurrentPassword = "OldPassword123!";
        handler.State.Input.NewPassword = "NewPassword123!";
        handler.State.Input.NewPasswordConfirmation = "NewPassword123!";

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

        handler.State.Input.CurrentPassword = "OldPassword123!";
        handler.State.Input.NewPassword = "NewPassword123!";
        handler.State.Input.NewPasswordConfirmation = "NewPassword123!";

        var errors = new IdentityError[] { new() { Description = "Incorrect password." } };
        UserManager.ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>()).Returns(IdentityResult.Failed(errors));

        // Act
        await handler.ChangePasswordAsync();

        // Assert
        HttpContext.Received(1).SetStatusMessage("Error: Failed to change the password.");
        handler.State.Input.Errors.Should().Contain("Incorrect password.");
        await SignInManager.DidNotReceive().RefreshSignInAsync(Arg.Any<User>());
    }

    private ChangePasswordPageHandler CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized) EnsureAuthenticated();
        var handler = new ChangePasswordPageHandler(HttpContext, NavigationManager, CurrentUser!, NullLoggerFactory.Instance);
        if (isConfigured) handler.Configure(UserManager, SignInManager);
        return handler;
    }
}