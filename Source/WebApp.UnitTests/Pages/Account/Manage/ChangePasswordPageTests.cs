namespace VttTools.WebApp.Pages.Account.Manage;

public class ChangePasswordPageTests
    : WebAppTestContext {
    public ChangePasswordPageTests() {
        EnsureAuthenticated();
    }

    [Fact]
    public void WhenRequested_RendersCorrectly() {
        // Act
        var cut = RenderComponent<ChangePasswordPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Change password</h3>");
        cut.Find("#change-password-form").Should().NotBeNull();
        cut.Find("#current-password-input").Should().NotBeNull();
        cut.Find("#new-password-input").Should().NotBeNull();
        cut.Find("#confirm-password-input").Should().NotBeNull();
        cut.Find("#change-password-submit").TextContent.Should().Be("Change password");
    }

    [Fact]
    public void WhenRequested_WithNoPassword_RedirectsToSetPassword() {
        // Arrange
        CurrentUser!.PasswordHash = null;

        // Act
        var cut = RenderComponent<ChangePasswordPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Assert
        navigationSpy.History.First().Uri.Should().Be("account/manage/set_password");
    }

    [Fact]
    public void WhenChangePasswordButtonIsClicked_WithValidData_UpdatesPassword() {
        // Arrange
        var cut = RenderComponent<ChangePasswordPage>();

        // Fill form
        cut.Find("#current-password-input").Change("OldPassword123!");
        cut.Find("#new-password-input").Change("NewPassword123!");
        cut.Find("#confirm-password-input").Change("NewPassword123!");

        UserManager.ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>())
                   .Returns(IdentityResult.Success);

        // Act
        cut.Find("#change-password-submit").Click();

        // Assert
        HttpContext.Received().SetStatusMessage("Your password has been changed.");
        SignInManager.Received(1).RefreshSignInAsync(Arg.Any<User>());
    }

    [Fact]
    public void WhenChangePasswordButtonIsClicked_WithInvalidData_ShowsErrorMessage() {
        // Arrange
        var cut = RenderComponent<ChangePasswordPage>();

        // Fill form
        cut.Find("#current-password-input").Change("WrongPassword");
        cut.Find("#new-password-input").Change("NewPassword123!");
        cut.Find("#confirm-password-input").Change("NewPassword123!");

        var errors = new IdentityError[] { new() { Description = "Incorrect password." } };
        UserManager.ChangePasswordAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>())
                   .Returns(IdentityResult.Failed(errors));

        // Act
        cut.Find("#change-password-submit").Click();

        // Assert
        HttpContext.Received().SetStatusMessage("Error: Failed to change the password.");
        SignInManager.DidNotReceive().RefreshSignInAsync(Arg.Any<User>());
    }
}