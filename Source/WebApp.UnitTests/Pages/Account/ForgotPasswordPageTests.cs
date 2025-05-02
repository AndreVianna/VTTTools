namespace VttTools.WebApp.Pages.Account;

public class ForgotPasswordPageTests
    : WebAppTestContext {
    private readonly IEmailSender<User> _emailSender;

    public ForgotPasswordPageTests() {
        _emailSender = Substitute.For<IEmailSender<User>>();
        Services.AddScoped(_ => _emailSender);
    }

    [Fact]
    public void ForgotPasswordPage_RendersCorrectly() {
        // Act
        var cut = RenderComponent<ForgotPasswordPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Forgot your password?</h1>");
        cut.Markup.Should().Contain("<h2>Enter your email.</h2>");

        var emailInput = cut.Find("#Input\\.Email");
        emailInput.Should().NotBeNull();

        var submitButton = cut.Find("button[type=submit]");
        submitButton.TextContent.Should().Be("Reset password");
    }

    [Fact]
    public void SubmittingForm_WithNonExistentEmail_RedirectsToConfirmationPage() {
        // Arrange
        var cut = RenderComponent<ForgotPasswordPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Fill in the email
        var emailInput = cut.Find("#Input\\.Email");
        emailInput.Change("nonexistent@example.com");

        UserManager.FindByEmailAsync("nonexistent@example.com").Returns((User?)null);

        // Act
        cut.Find("form").Submit();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == "account/forgot_password_confirmation");
        _emailSender.DidNotReceive().SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public void SubmittingForm_WithUnconfirmedEmail_RedirectsToConfirmationPage() {
        // Arrange
        var cut = RenderComponent<ForgotPasswordPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Fill in the email
        var emailInput = cut.Find("#Input\\.Email");
        emailInput.Change("unconfirmed@example.com");

        var user = new User { Email = "unconfirmed@example.com" };
        UserManager.FindByEmailAsync("unconfirmed@example.com").Returns(user);
        UserManager.IsEmailConfirmedAsync(user).Returns(false);

        // Act
        cut.Find("form").Submit();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == "account/forgot_password_confirmation");
        _emailSender.DidNotReceive().SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public void SubmittingForm_WithValidEmail_SendsResetLink() {
        // Arrange
        var cut = RenderComponent<ForgotPasswordPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Fill in the email
        var emailInput = cut.Find("#Input\\.Email");
        emailInput.Change("valid@example.com");

        var user = new User { Email = "valid@example.com" };
        UserManager.FindByEmailAsync("valid@example.com").Returns(user);
        UserManager.IsEmailConfirmedAsync(user).Returns(true);
        UserManager.GeneratePasswordResetTokenAsync(user).Returns("ResetToken");

        // Act
        cut.Find("form").Submit();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == "account/forgot_password_confirmation");
        _emailSender.Received(1).SendPasswordResetLinkAsync(
            Arg.Is<User>(u => u.Email == "valid@example.com"),
            Arg.Is<string>(s => s == "valid@example.com"),
            Arg.Any<string>());
    }
}