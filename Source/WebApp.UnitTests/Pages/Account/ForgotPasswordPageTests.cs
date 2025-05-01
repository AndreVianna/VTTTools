namespace VttTools.WebApp.Pages.Account;

public class ForgotPasswordPageTests : WebAppTestContext {
    private readonly UserManager<User> _userManager;
    private readonly IEmailSender<User> _emailSender;

    public ForgotPasswordPageTests() {
        _userManager = Substitute.For<UserManager<User>>(
            Substitute.For<IUserStore<User>>(),
            Substitute.For<IOptions<IdentityOptions>>(),
            Substitute.For<IPasswordHasher<User>>(),
            Array.Empty<IUserValidator<User>>(),
            Array.Empty<IPasswordValidator<User>>(),
            Substitute.For<ILookupNormalizer>(),
            new IdentityErrorDescriber(),
            Substitute.For<IServiceProvider>(),
            Substitute.For<ILogger<UserManager<User>>>());

        _emailSender = Substitute.For<IEmailSender<User>>();

        Services.AddScoped(_ => _userManager);
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
        var navigationManager = Services.GetRequiredService<NavigationManager>() as FakeNavigationManager;
        var cut = RenderComponent<ForgotPasswordPage>();

        // Fill in the email
        var emailInput = cut.Find("#Input\\.Email");
        emailInput.Change("nonexistent@example.com");

        _userManager.FindByEmailAsync("nonexistent@example.com").Returns((User?)null);

        // Act
        cut.Find("form").Submit();

        // Assert
        navigationManager!.History.Should().ContainSingle(x => x.Uri == "account/forgot_password_confirmation");
        _emailSender.DidNotReceive().SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public void SubmittingForm_WithUnconfirmedEmail_RedirectsToConfirmationPage() {
        // Arrange
        var navigationManager = Services.GetRequiredService<NavigationManager>() as FakeNavigationManager;
        var cut = RenderComponent<ForgotPasswordPage>();

        // Fill in the email
        var emailInput = cut.Find("#Input\\.Email");
        emailInput.Change("unconfirmed@example.com");

        var user = new User { Email = "unconfirmed@example.com" };
        _userManager.FindByEmailAsync("unconfirmed@example.com").Returns(user);
        _userManager.IsEmailConfirmedAsync(user).Returns(false);

        // Act
        cut.Find("form").Submit();

        // Assert
        navigationManager!.History.Should().ContainSingle(x => x.Uri == "account/forgot_password_confirmation");
        _emailSender.DidNotReceive().SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public void SubmittingForm_WithValidEmail_SendsResetLink() {
        // Arrange
        var navigationManager = Services.GetRequiredService<NavigationManager>() as FakeNavigationManager;
        var cut = RenderComponent<ForgotPasswordPage>();

        // Fill in the email
        var emailInput = cut.Find("#Input\\.Email");
        emailInput.Change("valid@example.com");

        var user = new User { Email = "valid@example.com" };
        _userManager.FindByEmailAsync("valid@example.com").Returns(user);
        _userManager.IsEmailConfirmedAsync(user).Returns(true);
        _userManager.GeneratePasswordResetTokenAsync(user).Returns("ResetToken");

        // Act
        cut.Find("form").Submit();

        // Assert
        navigationManager!.History.Should().ContainSingle(x => x.Uri == "account/forgot_password_confirmation");
        _emailSender.Received(1).SendPasswordResetLinkAsync(
            Arg.Is<User>(u => u.Email == "valid@example.com"),
            Arg.Is<string>(s => s == "valid@example.com"),
            Arg.Any<string>());
    }
}