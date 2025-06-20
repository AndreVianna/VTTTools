namespace VttTools.WebApp.Pages.Account;

public class LoginPageHandlerTests
    : ComponentTestContext {
    private readonly LoginPage _page = Substitute.For<LoginPage>();

    public LoginPageHandlerTests() {
        // Setup the page mock properties using NSubstitute's Returns method
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

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
        _page.State.HasExternalLoginProviders.Should().BeTrue();
    }

    [Fact]
    public async Task ConfigureAsync_WithPostRequest_DoesNotCheckForExternalLogins() {
        // Arrange
        var handler = await CreateHandler(false);
        HttpContext.Request.Method.Returns("POST");

        // Act
        await handler.ConfigureAsync();

        // Assert
        _page.State.HasExternalLoginProviders.Should().BeFalse();
    }

    [Fact]
    public async Task LoginUserAsync_WithValidCredentials_RedirectsUser() {
        // Arrange
        var handler = await CreateHandler();
        var input = new LoginPageInput {
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
        // Verify that SignInManager was called with correct parameters
        await SignInManager.Received(1).PasswordSignInAsync(input.Email, input.Password, input.RememberMe, lockoutOnFailure: true);
    }

    [Fact]
    public async Task LoginUserAsync_WithInvalidCredentials_SetsErrorMessage() {
        // Arrange
        var handler = await CreateHandler();
        var input = new LoginPageInput {
            Email = "test@example.com",
            Password = "WrongPassword",
        };

        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.Failed);

        // Act
        var result = await handler.LoginUserAsync(input, "/dashboard");

        // Assert
        result.Should().BeFalse();
        // Verify that SignInManager was called with correct parameters
        await SignInManager.Received(1).PasswordSignInAsync(input.Email, input.Password, input.RememberMe, lockoutOnFailure: true);
    }

    [Fact]
    public async Task LoginUserAsync_WithLockedOutAccount_RedirectsToLockoutPage() {
        // Arrange
        var handler = await CreateHandler();
        var input = new LoginPageInput {
            Email = "locked@example.com",
            Password = "Password123!",
        };

        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.LockedOut);

        // Act
        var result = await handler.LoginUserAsync(input, "/dashboard");

        // Assert
        result.Should().BeTrue();
        // Verify that SignInManager was called with correct parameters
        await SignInManager.Received(1).PasswordSignInAsync(input.Email, input.Password, input.RememberMe, lockoutOnFailure: true);
    }

    [Fact]
    public async Task LoginUserAsync_RequiringTwoFactor_RedirectsToTwoFactorPage() {
        // Arrange
        var handler = await CreateHandler();
        var input = new LoginPageInput {
            Email = "2fa@example.com",
            Password = "Password123!",
        };

        SignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
                     .Returns(SignInResult.TwoFactorRequired);

        // Act
        var result = await handler.LoginUserAsync(input, "/dashboard");

        // Assert
        result.Should().BeTrue();
        // Verify that SignInManager was called with correct parameters
        await SignInManager.Received(1).PasswordSignInAsync(input.Email, input.Password, input.RememberMe, lockoutOnFailure: true);
    }

    private async Task<LoginPageHandler> CreateHandler(bool isConfigured = true) {
        var handler = new LoginPageHandler(_page);
        if (isConfigured)
            await handler.ConfigureAsync();
        return handler;
    }
}