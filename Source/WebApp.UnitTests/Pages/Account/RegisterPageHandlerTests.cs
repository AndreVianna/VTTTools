namespace VttTools.WebApp.Pages.Account;

public class RegisterPageHandlerTests {
    private readonly RegisterPageHandler _handler;
    private readonly UserManager<User> _userManager;
    private readonly IUserStore<User> _userStore;
    private readonly SignInManager<User> _signInManager;
    private readonly NavigationManager _navigationManager;
    private readonly IEmailSender<User> _emailSender;
    private readonly ILogger<RegisterPage> _logger;

    public RegisterPageHandlerTests() {
        _handler = new();

        _userStore = Substitute.For<IUserStore<User>>();
        var emailStore = Substitute.For<IUserEmailStore<User>>();
        _userStore.As<IUserEmailStore<User>>().Returns(emailStore);

        _userManager = Substitute.For<UserManager<User>>(
            _userStore,
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
        _emailSender = Substitute.For<IEmailSender<User>>();
        _logger = Substitute.For<ILogger<RegisterPage>>();

        // Setup the NavigationManager to handle ToAbsoluteUri
        _navigationManager.ToAbsoluteUri(Arg.Any<string>()).Returns(info =>
            new($"https://example.com/{info.Arg<string>()}"));

        // Setup the NavigationManager to handle GetUriWithQueryParameters
        _navigationManager.GetUriWithQueryParameters(
            Arg.Any<string>(),
            Arg.Any<Dictionary<string, object?>>()
        ).Returns(info => $"{info.ArgAt<string>(0)}?params=true");

        _signInManager.GetExternalAuthenticationSchemesAsync().Returns([]);
    }

    [Fact]
    public async Task InitializeAsync_SetsExternalLoginProviders() {
        // Arrange
        var scheme = new AuthenticationScheme("Google", "Google", typeof(IAuthenticationHandler));
        _signInManager.GetExternalAuthenticationSchemesAsync().Returns([scheme]);

        // Act
        await _handler.InitializeAsync(
            _userManager,
            _userStore,
            _signInManager,
            _navigationManager,
            _emailSender,
            _logger
        );

        // Assert
        _handler.State.HasExternalLoginProviders.Should().BeTrue();
    }

    [Fact]
    public async Task RegisterUserAsync_WhenCreateFails_SetsErrors() {
        // Arrange
        _handler.State.Input.Name = "Test User";
        _handler.State.Input.Email = "test@example.com";
        _handler.State.Input.Password = "weak";
        _handler.State.Input.ConfirmPassword = "weak";

        var identityErrors = new IdentityError[] { new() { Description = "Password too weak" } };
        _userManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "weak"))
            .Returns(IdentityResult.Failed(identityErrors));

        // Act
        var result = await _handler.RegisterUserAsync(null);

        // Assert
        result.Should().BeFalse();
        _handler.State.IdentityErrors.Should().BeEquivalentTo(identityErrors);
    }

    [Fact]
    public async Task RegisterUserAsync_WhenCreateSucceeds_ReturnsTrue() {
        // Arrange
        _handler.State.Input.Name = "Test User";
        _handler.State.Input.Email = "test@example.com";
        _handler.State.Input.Password = "Password123!";
        _handler.State.Input.ConfirmPassword = "Password123!";

        var createdUser = new User {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
                                   };

        _userManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"))
            .Returns(IdentityResult.Success);
        _userManager.GetUserIdAsync(Arg.Any<User>()).Returns(createdUser.Id.ToString());
        _userManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("ConfirmationToken");
        _userManager.Options.SignIn.RequireConfirmedAccount.Returns(false);

        // Act
        var result = await _handler.RegisterUserAsync(null);

        // Assert
        result.Should().BeTrue();
        await _userStore.Received(1).SetUserNameAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "test@example.com"), Arg.Any<CancellationToken>());
        await _userStore.As<IUserEmailStore<User>>().Received(1).SetEmailAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "test@example.com"), Arg.Any<CancellationToken>());
        await _userManager.Received(1).CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"));
        await _signInManager.Received(1).SignInAsync(Arg.Any<User>(), Arg.Is<bool>(b => !b), Arg.Any<string>());
    }

    [Fact]
    public async Task RegisterUserAsync_WhenRequireConfirmedAccount_RedirectsToConfirmation() {
        // Arrange
        _handler.State.Input.Name = "Test User";
        _handler.State.Input.Email = "test@example.com";
        _handler.State.Input.Password = "Password123!";
        _handler.State.Input.ConfirmPassword = "Password123!";

        var createdUser = new User {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
                                   };

        _userManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"))
            .Returns(IdentityResult.Success);
        _userManager.GetUserIdAsync(Arg.Any<User>()).Returns(createdUser.Id.ToString());
        _userManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("ConfirmationToken");
        _userManager.Options.SignIn.RequireConfirmedAccount.Returns(true);

        // Act
        var result = await _handler.RegisterUserAsync("/return-url");

        // Assert
        result.Should().BeTrue();
        _navigationManager.Received(1).RedirectTo("account/register_confirmation", Arg.Is<Dictionary<string, object?>>(d =>
            d.ContainsKey("email") && d["email"]!.Equals("test@example.com") &&
            d.ContainsKey("returnUrl") && d["returnUrl"]!.Equals("/return-url")));
        await _signInManager.DidNotReceive().SignInAsync(Arg.Any<User>(), Arg.Any<bool>(), Arg.Any<string>());
    }
}