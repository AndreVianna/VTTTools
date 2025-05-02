namespace VttTools.WebApp.Pages.Account;

public class LoginPageTests : WebAppTestContext {
    private readonly SignInManager<User> _signInManager;
    private readonly UserManager<User> _userManager;
    private readonly HttpContext _httpContext;

    public LoginPageTests() {
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

        _httpContext = Substitute.For<HttpContext>();
        Substitute.For<IAuthenticationService>();

        var serviceProvider = Substitute.For<IServiceProvider>();
        _httpContext.RequestServices.Returns(serviceProvider);

        Services.AddScoped(_ => _signInManager);
        Services.AddScoped(_ => _userManager);
        Services.AddScoped(_ => _httpContext);
    }

    [Fact]
    public void LoginPage_RendersCorrectly() {
        // Arrange
        _httpContext.Request.Method.Returns("GET");
        _signInManager.GetExternalAuthenticationSchemesAsync().Returns([]);

        // Act
        var cut = RenderComponent<LoginPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Log in</h1>");
        cut.Find("button[type=submit]").TextContent.Should().Be("Log in");
        cut.Find("form").Should().NotBeNull();
    }

    [Fact]
    public void LoginPage_RendersExternalLoginProviders_WhenAvailable() {
        // Arrange
        _httpContext.Request.Method.Returns("GET");
        _signInManager.GetExternalAuthenticationSchemesAsync().Returns([
            new("Google", "Google", typeof(IAuthenticationHandler)),
                                                                       ]);

        // Act
        var cut = RenderComponent<LoginPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Use another service to log in.</h3>");
    }

    [Fact]
    public void Clicking_LoginButton_CallsLoginUser() {
        // Arrange
        _httpContext.Request.Method.Returns("GET");
        _signInManager.GetExternalAuthenticationSchemesAsync().Returns([]);
        var cut = RenderComponent<LoginPage>();

        // Fill in form values
        cut.Find("#Input\\.Email").Change("test@example.com");
        cut.Find("#Input\\.Password").Change("Password123!");

        // Set up successful login
        _signInManager.PasswordSignInAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<bool>(),
            Arg.Any<bool>()
        ).Returns(SignInResult.Success);

        var user = new User { Email = "test@example.com" };
        _userManager.FindByEmailAsync("test@example.com").Returns(user);

        var claimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity([
            new(ClaimTypes.Name, "test@example.com"),
                                                                     ]));
        _signInManager.ClaimsFactory.CreateAsync(user).Returns(claimsPrincipal);

        // Act
        cut.Find("form").Submit();

        // Assert
        _signInManager.Received(1).PasswordSignInAsync(
            Arg.Is<string>(s => s == "test@example.com"),
            Arg.Any<string>(),
            Arg.Any<bool>(),
            Arg.Is<bool>(b => b)
        );
    }

    [Fact]
    public void LoginUser_WithInvalidCredentials_ShowsErrorMessage() {
        // Arrange
        _httpContext.Request.Method.Returns("GET");
        _signInManager.GetExternalAuthenticationSchemesAsync().Returns([]);
        var cut = RenderComponent<LoginPage>();

        // Fill in form values
        cut.Find("#Input\\.Email").Change("test@example.com");
        cut.Find("#Input\\.Password").Change("WrongPassword");

        // Set up failed login
        _signInManager.PasswordSignInAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<bool>(),
            Arg.Any<bool>()
        ).Returns(SignInResult.Failed);

        // Act
        cut.Find("form").Submit();

        // Assert
        cut.WaitForState(() => cut.Instance.State.ErrorMessage != null);
        cut.Instance.State.ErrorMessage.Should().Be("Error: Invalid login attempt.");
    }

    [Fact]
    public void LoginUser_WithLockedOutAccount_RedirectsToLockoutPage() {
        // Arrange
        _httpContext.Request.Method.Returns("GET");
        _signInManager.GetExternalAuthenticationSchemesAsync().Returns([]);
        var cut = RenderComponent<LoginPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Fill in form values
        cut.Find("#Input\\.Email").Change("locked@example.com");
        cut.Find("#Input\\.Password").Change("Password123!");

        // Set up locked out result
        _signInManager.PasswordSignInAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<bool>(),
            Arg.Any<bool>()
        ).Returns(SignInResult.LockedOut);

        // Act
        cut.Find("form").Submit();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == "account/lockout");
    }

    [Fact]
    public void LoginUser_RequiringTwoFactor_RedirectsToTwoFactorPage() {
        // Arrange
        _httpContext.Request.Method.Returns("GET");
        _signInManager.GetExternalAuthenticationSchemesAsync().Returns([]);
        var cut = RenderComponent<LoginPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Fill in form values
        cut.Find("#Input\\.Email").Change("2fa@example.com");
        cut.Find("#Input\\.Password").Change("Password123!");

        // Set up two-factor result
        _signInManager.PasswordSignInAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<bool>(),
            Arg.Any<bool>()
        ).Returns(SignInResult.TwoFactorRequired);

        // Act
        cut.Find("form").Submit();

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == "/account/login_with_2fa");
    }
}