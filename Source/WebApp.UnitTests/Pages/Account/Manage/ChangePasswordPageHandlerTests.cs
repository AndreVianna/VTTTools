namespace VttTools.WebApp.Pages.Account.Manage;

public class ChangePasswordPageHandlerTests
    : WebAppTestContext {
    [Fact]
    public void Configure_WhenUserHasNoPassword_RedirectsToSetPassword() {
        // Arrange
        var handler = CreateHandler(isConfigured: false);
        CurrentUser!.HasPassword = false;

        // Act
        handler.Configure(UserManager, SignInManager);

        // Assert
        NavigationManager.History.First().Uri.Should().Be("account/manage/set_password");
    }

    [Fact]
    public async Task ChangePasswordAsync_WithSuccessfulChange_RefreshesSignIn() {
        // Arrange
        var handler = CreateHandler(isConfigured: false);

        handler.State.Input.CurrentPassword = "OldPassword123!";
        handler.State.Input.NewPassword = "NewPassword123!";
        handler.State.Input.NewPasswordConfirmation = "NewPassword123!";

        UserManager.ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>())
            .Returns(IdentityResult.Success);

        // Act
        var result = await handler.ChangePasswordAsync();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ChangePasswordAsync_WithFailure_SetsErrorMessage() {
        // Arrange
        var handler = CreateHandler(isConfigured: false);

        handler.State.Input.CurrentPassword = "OldPassword123!";
        handler.State.Input.NewPassword = "NewPassword123!";
        handler.State.Input.NewPasswordConfirmation = "NewPassword123!";

        var errors = new IdentityError[] { new() { Description = "Incorrect password." } };
        UserManager.ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>()).Returns(IdentityResult.Failed(errors));

        // Act
        var result = await handler.ChangePasswordAsync();

        // Assert
        result.Should().BeFalse();
        HttpContext.Received(1).SetStatusMessage("Error: Failed to change the password.");
        handler.State.Input.Errors.Should().Contain("Incorrect password.");
        await SignInManager.DidNotReceive().RefreshSignInAsync(Arg.Any<User>());
    }

    private ChangePasswordPageHandler CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized) UseDefaultUser();
        var handler = new ChangePasswordPageHandler(HttpContext, NavigationManager, CurrentUser!, NullLoggerFactory.Instance);
        if (isConfigured) handler.Configure(UserManager, SignInManager);
        return handler;
    }
}