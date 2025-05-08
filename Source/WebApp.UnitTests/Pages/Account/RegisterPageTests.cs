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
        cut.Find("#confirmation-input").Should().NotBeNull();
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
        cut.Markup.Should().Contain("<h3>Use another client to register.</h3>");
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
        cut.Find("#confirmation-input").Change("Password123!");

        var createdUser = new User {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
        };

        // Mock the user creation flow
        UserManager.CreateAsync(Arg.Any<User>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        UserManager.GetUserIdAsync(Arg.Any<User>()).Returns(createdUser.Id.ToString());
        UserManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("ConfirmationToken");

        // Act
        cut.Find("#register-submit").Click();

        // Assert
        UserManager.Received(1).CreateAsync(Arg.Any<User>(), Arg.Any<string>());
        SignInManager.Received(1).SignInAsync(Arg.Any<User>(), Arg.Any<bool>(), Arg.Any<string>());
        _emailSender.Received(1).SendConfirmationLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());

        navigationSpy.History.First().Uri.Should().Be(string.Empty);
    }

    [Fact]
    public void WhenSubmitButtonIsClicked_WithInvalidData_ShowsErrors() {
        // Arrange
        var cut = RenderComponent<RegisterPage>();

        // Fill in the form
        cut.Find("#name-input").Change("Test User");
        cut.Find("#email-input").Change("test@example.com");
        cut.Find("#password-input").Change("weak");
        cut.Find("#confirmation-input").Change("weak");

        // Act
        cut.Find("#register-submit").Click();

        // Assert
        UserManager.DidNotReceive().CreateAsync(Arg.Any<User>(), Arg.Any<string>());
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
        cut.Find("#confirmation-input").Change("Password123!");

        var createdUser = new User {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
        };

        // Mock the user creation flow
        UserManager.CreateAsync(Arg.Any<User>(), Arg.Any<string>()).Returns(IdentityResult.Success);
        UserManager.GetUserIdAsync(Arg.Any<User>()).Returns(createdUser.Id.ToString());
        UserManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("ConfirmationToken");
        UserManager.Options.SignIn.RequireConfirmedAccount = true;

        // Act
        cut.Find("#register-submit").Click();

        // Assert
        SignInManager.DidNotReceive().SignInAsync(Arg.Any<User>(), Arg.Any<bool>(), Arg.Any<string>());
        navigationSpy.History.First().Uri.Should().Be("account/register_confirmation?email=test%40example.com");
    }
}