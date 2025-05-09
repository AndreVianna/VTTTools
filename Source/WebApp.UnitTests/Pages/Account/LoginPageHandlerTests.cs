namespace VttTools.WebApp.Pages.Account;

public class LoginPageHandlerTests
    : ComponentTestContext {
    [Fact]
    public async Task ConfigureAsync_WithGetRequest_ChecksForExternalLogins() {
        // Arrange
        var handler = await CreateHandler(false);
        HttpContext.Request.Method.Returns("GET");
        var provider = new AuthenticationScheme("Google", "Google", typeof(IAuthenticationHandler));
        var externalLogins = new[] { provider };
        SignInManager.GetExternalAuthenticationSchemesAsync().Returns(externalLogins);

        // Act
        await handler.ConfigureAsync();

        // Assert
        handler.State.HasExternalLoginProviders.Should().BeTrue();
    }

    [Fact]
    public async Task ConfigureAsync_WithPostRequest_DoesNotCheckForExternalLogins() {
        // Arrange
        var handler = await CreateHandler(false);
        HttpContext.Request.Method.Returns("POST");

        // Act
        await handler.ConfigureAsync();

        // Assert
        handler.State.HasExternalLoginProviders.Should().BeFalse();
    }

    [Fact]
    public async Task LoginUserAsync_WithValidCredentials_RedirectsUser() {
        // Arrange
        var handler = await CreateHandler();
        var input = new LoginInputModel {
            Email = "test@example.com",
            Password = "Password123!",
        };

        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.Success);

        var user = new User { Email = "test@example.com", DisplayName = "User" };
        UserManager.FindByEmailAsync("test@example.com").Returns(user);

        var claim = new Claim(ClaimTypes.Name, "test@example.com");
        var claimsIdentity = new ClaimsIdentity([claim]);
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        SignInManager.ClaimsFactory.CreateAsync(user).Returns(claimsPrincipal);

        // Act
        var result = await handler.LoginUserAsync(input, "/dashboard");

        // Assert
        result.Should().BeTrue();
        NavigationManager.History.First().Uri.Should().Be("/dashboard");
    }

    [Fact]
    public async Task LoginUserAsync_WithInvalidCredentials_SetsErrorMessage() {
        // Arrange
        var handler = await CreateHandler();
        var input = new LoginInputModel {
            Email = "test@example.com",
            Password = "WrongPassword",
        };

        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.Failed);

        // Act
        var result = await handler.LoginUserAsync(input, "/dashboard");

        // Assert
        result.Should().BeFalse();
        HttpContext.Received(1).SetStatusMessage("Error: Invalid login attempt.");
    }

    [Fact]
    public async Task LoginUserAsync_WithLockedOutAccount_RedirectsToLockoutPage() {
        // Arrange
        var handler = await CreateHandler();
        var input = new LoginInputModel {
            Email = "locked@example.com",
            Password = "Password123!",
        };

        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.LockedOut);

        // Act
        var result = await handler.LoginUserAsync(input, "/dashboard");

        // Assert
        result.Should().BeTrue();
        NavigationManager.History.First().Uri.Should().Be("account/lockout");
    }

    [Fact]
    public async Task LoginUserAsync_RequiringTwoFactor_RedirectsToTwoFactorPage() {
        // Arrange
        var handler = await CreateHandler();
        var input = new LoginInputModel {
            Email = "2fa@example.com",
            Password = "Password123!",
        };

        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.TwoFactorRequired);

        // Act
        var result = await handler.LoginUserAsync(input, "/dashboard");

        // Assert
        result.Should().BeTrue();
        NavigationManager.History.First().Uri.Should().Be("account/login_with_2fa?returnUrl=%2Fdashboard&rememberMe=False");
    }

    private async Task<LoginPageHandler> CreateHandler(bool isConfigured = true) {
        var page = Substitute.For<IPublicPage>();
        page.HttpContext.Returns(HttpContext);
        page.NavigationManager.Returns(NavigationManager);
        page.Logger.Returns(NullLogger.Instance);
        var handler = new LoginPageHandler(page);
        if (isConfigured)
            await handler.ConfigureAsync();
        return handler;
    }
}