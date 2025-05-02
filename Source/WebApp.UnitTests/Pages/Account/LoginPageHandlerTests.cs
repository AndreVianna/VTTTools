namespace VttTools.WebApp.Pages.Account;

public class LoginPageHandlerTests {
    private readonly LoginPageHandler _handler;
    private readonly SignInManager<User> _signInManager;
    private readonly UserManager<User> _userManager;
    private readonly NavigationManager _navigationManager;
    private readonly ILogger<LoginPage> _logger;
    private readonly HttpContext _httpContext;

    public LoginPageHandlerTests() {
        _handler = new();

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

        _signInManager = Substitute.For<SignInManager<User>>(
            _userManager,
            Substitute.For<IHttpContextAccessor>(),
            Substitute.For<IUserClaimsPrincipalFactory<User>>(),
            Substitute.For<IOptions<IdentityOptions>>(),
            Substitute.For<ILogger<SignInManager<User>>>(),
            Substitute.For<IAuthenticationSchemeProvider>(),
            Substitute.For<IUserConfirmation<User>>());

        _navigationManager = Substitute.For<NavigationManager>();
        _logger = Substitute.For<ILogger<LoginPage>>();

        _httpContext = Substitute.For<HttpContext>();
        Substitute.For<IAuthenticationService>();

        var serviceProvider = Substitute.For<IServiceProvider>();
        _httpContext.RequestServices.Returns(serviceProvider);
    }

    [Fact]
    public async Task InitializeAsync_WithGetRequest_ChecksForExternalLogins() {
        // Arrange
        _httpContext.Request.Method.Returns("GET");
        var externalLogins = new List<AuthenticationScheme> {
            new("Google", "Google", typeof(IAuthenticationHandler)),
                                                            };
        _signInManager.GetExternalAuthenticationSchemesAsync().Returns(externalLogins);

        // Act
        await _handler.InitializeAsync(_httpContext, _userManager, _signInManager, _navigationManager, _logger);

        // Assert
        _handler.State.HasExternalLoginProviders.Should().BeTrue();
        await _httpContext.Received(1).SignOutAsync(IdentityConstants.ExternalScheme);
    }

    [Fact]
    public async Task InitializeAsync_WithPostRequest_DoesNotCheckForExternalLogins() {
        // Arrange
        _httpContext.Request.Method.Returns("POST");

        // Act
        await _handler.InitializeAsync(_httpContext, _userManager, _signInManager, _navigationManager, _logger);

        // Assert
        await _httpContext.DidNotReceive().SignOutAsync(IdentityConstants.ExternalScheme);
        await _signInManager.DidNotReceive().GetExternalAuthenticationSchemesAsync();
    }

    [Fact]
    public async Task LoginUserAsync_WithValidCredentials_RedirectsUser() {
        // Arrange
        await _handler.InitializeAsync(_httpContext, _userManager, _signInManager, _navigationManager, _logger);
        _handler.State.Input.Email = "test@example.com";
        _handler.State.Input.Password = "Password123!";

        _signInManager.PasswordSignInAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<bool>(),
            Arg.Any<bool>()
        ).Returns(SignInResult.Success);

        var user = new User { Email = "test@example.com" };
        _userManager.FindByEmailAsync("test@example.com").Returns(user);

        var claim = new Claim(ClaimTypes.Name, "test@example.com");
        var claimsIdentity = new ClaimsIdentity([claim]);
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        _signInManager.ClaimsFactory.CreateAsync(user).Returns(claimsPrincipal);

        // Act
        var result = await _handler.LoginUserAsync("/dashboard");

        // Assert
        result.Should().BeTrue();
        _navigationManager.Received(1).RedirectTo("/dashboard");
        await _httpContext.Received(1).SignInAsync(IdentityConstants.ExternalScheme, claimsPrincipal);
    }

    [Fact]
    public async Task LoginUserAsync_WithInvalidCredentials_SetsErrorMessage() {
        // Arrange
        await _handler.InitializeAsync(_httpContext, _userManager, _signInManager, _navigationManager, _logger);
        _handler.State.Input.Email = "test@example.com";
        _handler.State.Input.Password = "WrongPassword";

        _signInManager.PasswordSignInAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<bool>(),
            Arg.Any<bool>()
        ).Returns(SignInResult.Failed);

        // Act
        var result = await _handler.LoginUserAsync("/dashboard");

        // Assert
        result.Should().BeFalse();
        _handler.State.ErrorMessage.Should().Be("Error: Invalid login attempt.");
    }

    [Fact]
    public async Task LoginUserAsync_WithLockedOutAccount_RedirectsToLockoutPage() {
        // Arrange
        await _handler.InitializeAsync(_httpContext, _userManager, _signInManager, _navigationManager, _logger);
        _handler.State.Input.Email = "locked@example.com";
        _handler.State.Input.Password = "Password123!";

        _signInManager.PasswordSignInAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<bool>(),
            Arg.Any<bool>()
        ).Returns(SignInResult.LockedOut);

        // Act
        var result = await _handler.LoginUserAsync("/dashboard");

        // Assert
        result.Should().BeTrue();
        _navigationManager.Received(1).RedirectTo("account/lockout");
    }

    [Fact]
    public async Task LoginUserAsync_RequiringTwoFactor_RedirectsToTwoFactorPage() {
        // Arrange
        await _handler.InitializeAsync(_httpContext, _userManager, _signInManager, _navigationManager, _logger);
        _handler.State.Input.Email = "2fa@example.com";
        _handler.State.Input.Password = "Password123!";

        _signInManager.PasswordSignInAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<bool>(),
            Arg.Any<bool>()
        ).Returns(SignInResult.TwoFactorRequired);

        // Act
        var result = await _handler.LoginUserAsync("/dashboard");

        // Assert
        result.Should().BeTrue();
        _navigationManager.Received(1).RedirectTo("account/login_with_2fa", Arg.Any<Action<IDictionary<string, object?>>?>());
    }
}