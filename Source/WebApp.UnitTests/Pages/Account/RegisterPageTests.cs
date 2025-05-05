namespace VttTools.WebApp.Pages.Account;

public class RegisterPageTests
    : WebAppTestContext {
    private readonly IEmailSender<User> _emailSender;

    public RegisterPageTests() {
        _emailSender = Substitute.For<IEmailSender<User>>();
        Services.AddScoped(_ => _emailSender);
        SignInManager.GetExternalAuthenticationSchemesAsync().Returns([]);
    }

    [Fact]
    public void WhenRequested_RendersCorrectly() {
        // Act
        var cut = RenderComponent<RegisterPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Register</h1>");
        cut.Markup.Should().Contain("<h2>Create a new account.</h2>");
        cut.Find("#register-form").Should().NotBeNull();
        cut.Find("#name-input").Should().NotBeNull();
        cut.Find("#email-input").Should().NotBeNull();
        cut.Find("#password-input").Should().NotBeNull();
        cut.Find("#confirm-password-input").Should().NotBeNull();
        cut.Find("#register-submit").TextContent.Should().Be("Register");
    }

    [Fact]
    public void WhenRequested_WithExternalLoginProviders_ShowsLoginProvidersSection() {
        // Arrange
        var scheme = new AuthenticationScheme("Google", "Google", typeof(IAuthenticationHandler));
        SignInManager.GetExternalAuthenticationSchemesAsync().Returns([scheme]);

        // Act
        var cut = RenderComponent<RegisterPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Use another service to register.</h3>");
    }

    [Fact]
    public void WhenSubmitButtonIsClicked_WithValidData_RegistersUserAndRedirectsToHome() {
        // Arrange
        var cut = RenderComponent<RegisterPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Fill in the form
        cut.Find("#name-input").Change("Test User");
        cut.Find("#email-input").Change("test@example.com");
        cut.Find("#password-input").Change("Password123!");
        cut.Find("#confirm-password-input").Change("Password123!");

        var createdUser = new User {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
                                   };

        // Mock the user creation flow
        UserManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"))
            .Returns(IdentityResult.Success);
        UserManager.GetUserIdAsync(Arg.Any<User>()).Returns(createdUser.Id.ToString());
        UserManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("ConfirmationToken");
        UserManager.Options.SignIn.RequireConfirmedAccount.Returns(false);

        // Act
        cut.Find("#register-submit").Click();

        // Assert
        UserManager.Received(1).CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"));
        SignInManager.Received(1).SignInAsync(Arg.Any<User>(), Arg.Is<bool>(b => !b), Arg.Any<string>());
        _emailSender.Received(1).SendConfirmationLinkAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "test@example.com"), Arg.Any<string>());

        navigationSpy.History.Should().ContainSingle(x => x.Uri == "/");
    }

    [Fact]
    public void WhenSubmitButtonIsClicked_WithInvalidData_ShowsErrors() {
        // Arrange
        var cut = RenderComponent<RegisterPage>();

        // Fill in the form
        cut.Find("#name-input").Change("Test User");
        cut.Find("#email-input").Change("test@example.com");
        cut.Find("#password-input").Change("weak");
        cut.Find("#confirm-password-input").Change("weak");

        UserManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "weak"))
            .Returns(IdentityResult.Failed(new IdentityError { Description = "Password too weak" }));

        // Act
        cut.Find("#register-submit").Click();

        // Assert
        UserManager.Received(1).CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "weak"));
        cut.WaitForState(() => cut.Instance.State.IdentityErrors != null);
        cut.Markup.Should().Contain("Error: Password too weak");
    }

    [Fact]
    public void WhenSubmitButtonIsClicked_WhenRequiresConfirmedAccount_RedirectsToConfirmationPage() {
        // Arrange
        var cut = RenderComponent<RegisterPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Fill in the form
        cut.Find("#name-input").Change("Test User");
        cut.Find("#email-input").Change("test@example.com");
        cut.Find("#password-input").Change("Password123!");
        cut.Find("#confirm-password-input").Change("Password123!");

        var createdUser = new User {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
                                   };

        // Mock the user creation flow
        UserManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"))
            .Returns(IdentityResult.Success);
        UserManager.GetUserIdAsync(Arg.Any<User>()).Returns(createdUser.Id.ToString());
        UserManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("ConfirmationToken");
        UserManager.Options.SignIn.RequireConfirmedAccount.Returns(true);

        // Act
        cut.Find("#register-submit").Click();

        // Assert
        SignInManager.DidNotReceive().SignInAsync(Arg.Any<User>(), Arg.Any<bool>(), Arg.Any<string>());
        navigationSpy.History.Should().ContainSingle(x => x.Uri == "/account/register_confirmation");
    }
}