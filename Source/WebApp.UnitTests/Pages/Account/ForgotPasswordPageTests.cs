namespace VttTools.WebApp.Pages.Account;

public class ForgotPasswordPageTests
    : WebAppTestContext {
    private readonly IEmailSender<User> _emailSender;

    public ForgotPasswordPageTests() {
        _emailSender = Substitute.For<IEmailSender<User>>();
        Services.AddScoped(_ => _emailSender);
    }

    [Fact]
    public void WhenRequested_RendersCorrectly() {
        // Act
        var cut = RenderComponent<ForgotPasswordPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Forgot your password?</h1>");
        cut.Markup.Should().Contain("<h2>Enter your email.</h2>");

        cut.Find("#forgot-password-form").Should().NotBeNull();
        cut.Find("#email-input").Should().NotBeNull();
        cut.Find("#forgot-password-submit").TextContent.Should().Be("Reset password");
    }

    [Fact]
    public void SubmittingForm_WithNonExistentEmail_RedirectsToConfirmationPage() {
        // Arrange
        var cut = RenderComponent<ForgotPasswordPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        var emailInput = cut.Find("#email-input");
        emailInput.Change("nonexistent@example.com");

        UserManager.FindByEmailAsync("nonexistent@example.com").Returns((User?)null);

        // Act
        cut.Find("#forgot-password-submit").Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be("account/forgot_password_confirmation");
        _emailSender.DidNotReceive().SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public void SubmittingForm_WithUnconfirmedEmail_RedirectsToConfirmationPage() {
        // Arrange
        var cut = RenderComponent<ForgotPasswordPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        var emailInput = cut.Find("#email-input");
        emailInput.Change("unconfirmed@example.com");

        var user = new User { Email = "unconfirmed@example.com" };
        UserManager.FindByEmailAsync("unconfirmed@example.com").Returns(user);
        UserManager.IsEmailConfirmedAsync(user).Returns(false);

        // Act
        cut.Find("#forgot-password-submit").Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be("account/forgot_password_confirmation");
        _emailSender.DidNotReceive().SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public void SubmittingForm_WithValidEmail_SendsResetLink() {
        // Arrange
        var cut = RenderComponent<ForgotPasswordPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        var emailInput = cut.Find("#email-input");
        emailInput.Change("valid@example.com");

        var user = new User { Email = "valid@example.com" };
        UserManager.FindByEmailAsync("valid@example.com").Returns(user);
        UserManager.IsEmailConfirmedAsync(user).Returns(true);
        UserManager.GeneratePasswordResetTokenAsync(user).Returns("ResetToken");

        // Act
        cut.Find("#forgot-password-submit").Click();

        // Assert
        navigationSpy.History.First().Uri.Should().Be("account/forgot_password_confirmation");
        _emailSender.Received(1).SendPasswordResetLinkAsync(
            Arg.Is<User>(u => u.Email == "valid@example.com"),
            Arg.Is<string>(s => s == "valid@example.com"),
            Arg.Any<string>());
    }
}