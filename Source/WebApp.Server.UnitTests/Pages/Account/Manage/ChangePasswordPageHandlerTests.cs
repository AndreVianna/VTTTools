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
        EnsureAuthenticated();
        CurrentUser!.PasswordHash = null;
        _page.AccountOwner.Returns(CurrentUser);
        var handler = new ChangePasswordPageHandler(_page);

        // Act
        var result = handler.Configure();

        // Assert
        result.Should().BeFalse();
        _page.Received(1).RedirectTo("account/manage/set_password");
    }

    [Fact]
    public async Task ChangePasswordAsync_WithSuccessfulChange_RefreshesSignIn() {
        // Arrange
        var handler = CreateHandler();

        _page.State.Input.CurrentPassword = "OldPassword123!";
        _page.State.Input.NewPassword = "NewPassword123!";
        _page.State.Input.NewPasswordConfirmation = "NewPassword123!";

        UserManager.ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>())
            .Returns(IdentityResult.Success);

        // Act
        await handler.ChangePasswordAsync();

        // Assert
        await UserManager.Received(1).ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
        await SignInManager.Received(1).RefreshSignInAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task ChangePasswordAsync_WithFailure_SetsErrorMessage() {
        // Arrange
        var handler = CreateHandler();

        _page.State.Input.CurrentPassword = "OldPassword123!";
        _page.State.Input.NewPassword = "NewPassword123!";
        _page.State.Input.NewPasswordConfirmation = "NewPassword123!";

        var errors = new IdentityError[] { new() { Description = "Incorrect password." } };
        UserManager.ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>()).Returns(IdentityResult.Failed(errors));

        // Act
        await handler.ChangePasswordAsync();

        // Assert
        await UserManager.Received(1).ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
        _page.State.Errors.Should().Contain(e => e.Message == "Incorrect password.");
        await SignInManager.DidNotReceive().RefreshSignInAsync(Arg.Any<User>());
    }

    private ChangePasswordPageHandler CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized) {
            EnsureAuthenticated();
            _page.AccountOwner.Returns(CurrentUser);
        }
        var handler = new ChangePasswordPageHandler(_page);
        if (isConfigured)
            handler.Configure();
        return handler;
    }
}