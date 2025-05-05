namespace VttTools.WebApp.Pages.Account;

public class LoginPageTests
    : WebAppTestContext {
    public LoginPageTests() {
        HttpContext.Request.Method.Returns("GET");
        SignInManager.GetExternalAuthenticationSchemesAsync().Returns([]);
    }

    [Fact]
    public void WhenRequested_RendersCorrectly() {
        // Act
        var cut = RenderComponent<LoginPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Log in</h1>");
        cut.Find("#login-form").Should().NotBeNull();
        cut.Find("#login-submit").TextContent.Should().Be("Sign in");
    }

    [Fact]
    public void WhenInitialized_WithExternalProviders_ShowsProviders() {
        // Arrange
        var provider = new AuthenticationScheme("Google", "Google", typeof(IAuthenticationHandler));
        var externalLogins = new[] { provider };
        SignInManager.GetExternalAuthenticationSchemesAsync().Returns(externalLogins);

        // Act
        var cut = RenderComponent<LoginPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Use another service to log in.</h3>");
    }

    [Fact]
    public void WhenLoginButtonIsClicked_WithValidUser_SignsInTheUser() {
        // Arrange
        const string email = "test@example.com";
        const string password = "S0m3P455w0rd!";
        var cut = RenderComponent<LoginPage>();
        cut.Find("#email-input").Change(email);
        cut.Find("#password-input").Change(password);
        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.Success);

        var user = new User { Email = email };
        UserManager.FindByEmailAsync(Arg.Any<string>()).Returns(user);

        var claim = new Claim(ClaimTypes.Name, email);
        var claimsIdentity = new ClaimsIdentity([claim]);
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        SignInManager.ClaimsFactory.CreateAsync(user).Returns(claimsPrincipal);

        // Act
        cut.Find("#login-submit").Click();

        // Assert
        SignInManager.Received(1).PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>());
    }

    [Fact]
    public void WhenLoginButtonIsClicked_WithInvalidCredentials_ShowsErrorMessage() {
        // Arrange
        const string email = "test@example.com";
        const string password = "WrongPassword";
        var cut = RenderComponent<LoginPage>();
        cut.Find("#email-input").Change(email);
        cut.Find("#password-input").Change(password);
        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.Failed);

        // Act
        cut.Find("#login-submit").Click();

        // Assert
        cut.WaitForState(() => cut.Instance.State.ErrorMessage != null, TimeSpan.FromMilliseconds(500));
        cut.Instance.State.ErrorMessage.Should().Be("Error: Invalid login attempt.");
    }

    [Fact]
    public void WhenLoginButtonIsClicked_WithLockedOutAccount_RedirectsToLockoutPage() {
        // Arrange
        const string email = "test@example.com";
        const string password = "S0m3P455w0rd!";
        var cut = RenderComponent<LoginPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        cut.Find("#email-input").Change(email);
        cut.Find("#password-input").Change(password);
        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.LockedOut);

        // Act
        cut.Find("#login-submit").Click();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == "account/lockout");
    }

    [Fact]
    public void WhenLoginButtonIsClicked_RequiringTwoFactor_RedirectsToTwoFactorPage() {
        // Arrange
        const string email = "test@example.com";
        const string password = "S0m3P455w0rd!";
        var cut = RenderComponent<LoginPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        cut.Find("#email-input").Change(email);
        cut.Find("#password-input").Change(password);
        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.TwoFactorRequired);

        // Act
        cut.Find("#login-submit").Click();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == "/account/login_with_2fa");
    }
}