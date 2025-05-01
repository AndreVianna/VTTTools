namespace VttTools.WebApp.Pages.Account;

public class RegisterPageTests : WebAppTestContext {
    private readonly UserManager<User> _userManager;
    private readonly IUserStore<User> _userStore;
    private readonly SignInManager<User> _signInManager;
    private readonly IEmailSender<User> _emailSender;

    public RegisterPageTests() {
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

        _emailSender = Substitute.For<IEmailSender<User>>();

        Services.AddScoped(_ => _userManager);
        Services.AddScoped(_ => _userStore);
        Services.AddScoped(_ => _signInManager);
        Services.AddScoped(_ => _emailSender);

        _signInManager.GetExternalAuthenticationSchemesAsync().Returns([]);
    }

    [Fact]
    public void RegisterPage_RendersCorrectly() {
        // Act
        var cut = RenderComponent<RegisterPage>();

        // Assert
        cut.Markup.Should().Contain("<h1>Register</h1>");
        cut.Markup.Should().Contain("<h2>Create a new account.</h2>");

        var nameInput = cut.Find("#Input\\.Name");
        nameInput.Should().NotBeNull();

        var emailInput = cut.Find("#Input\\.Email");
        emailInput.Should().NotBeNull();

        var passwordInput = cut.Find("#Input\\.Password");
        passwordInput.Should().NotBeNull();

        var confirmPasswordInput = cut.Find("#Input\\.ConfirmPassword");
        confirmPasswordInput.Should().NotBeNull();

        var submitButton = cut.Find("button[type=submit]");
        submitButton.TextContent.Should().Be("Register");
    }

    [Fact]
    public void RegisterPage_WithExternalLoginProviders_ShowsLoginProvidersSection() {
        // Arrange
        var scheme = new AuthenticationScheme("Google", "Google", typeof(IAuthenticationHandler));
        _signInManager.GetExternalAuthenticationSchemesAsync().Returns([scheme]);

        // Act
        var cut = RenderComponent<RegisterPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Use another service to register.</h3>");
    }

    [Fact]
    public void SubmittingForm_WhenCreateSucceeds_RedirectsUser() {
        // Arrange
        var navigationManager = Services.GetRequiredService<NavigationManager>() as FakeNavigationManager;
        var cut = RenderComponent<RegisterPage>();

        // Fill in the form
        cut.Find("#Input\\.Name").Change("Test User");
        cut.Find("#Input\\.Email").Change("test@example.com");
        cut.Find("#Input\\.Password").Change("Password123!");
        cut.Find("#Input\\.ConfirmPassword").Change("Password123!");

        var createdUser = new User {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
                                   };

        // Mock the user creation flow
        _userManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"))
            .Returns(IdentityResult.Success);
        _userManager.GetUserIdAsync(Arg.Any<User>()).Returns(createdUser.Id.ToString());
        _userManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("ConfirmationToken");
        _userManager.Options.SignIn.RequireConfirmedAccount.Returns(false);

        // Act
        cut.Find("form").Submit();

        // Assert
        _userStore.Received(1).SetUserNameAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "test@example.com"), Arg.Any<CancellationToken>());
        _userStore.As<IUserEmailStore<User>>().Received(1).SetEmailAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "test@example.com"), Arg.Any<CancellationToken>());
        _userManager.Received(1).CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"));
        _signInManager.Received(1).SignInAsync(Arg.Any<User>(), Arg.Is<bool>(b => !b), Arg.Any<string>());
        _emailSender.Received(1).SendConfirmationLinkAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "test@example.com"), Arg.Any<string>());

        navigationManager!.History.Should().ContainSingle(x => x.Uri == "/");
    }

    [Fact]
    public void SubmittingForm_WhenCreateFails_ShowsErrors() {
        // Arrange
        var cut = RenderComponent<RegisterPage>();

        // Fill in the form
        cut.Find("#Input\\.Name").Change("Test User");
        cut.Find("#Input\\.Email").Change("test@example.com");
        cut.Find("#Input\\.Password").Change("weak");
        cut.Find("#Input\\.ConfirmPassword").Change("weak");

        _userManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "weak"))
            .Returns(IdentityResult.Failed(new IdentityError { Description = "Password too weak" }));

        // Act
        cut.Find("form").Submit();

        // Assert
        _userManager.Received(1).CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "weak"));
        cut.WaitForState(() => cut.Instance.State.IdentityErrors != null);
        cut.Markup.Should().Contain("Error: Password too weak");
    }

    [Fact]
    public void SubmittingForm_WhenRequireConfirmedAccount_RedirectsToConfirmationPage() {
        // Arrange
        var navigationManager = Services.GetRequiredService<NavigationManager>() as FakeNavigationManager;
        var cut = RenderComponent<RegisterPage>();

        // Fill in the form
        cut.Find("#Input\\.Name").Change("Test User");
        cut.Find("#Input\\.Email").Change("test@example.com");
        cut.Find("#Input\\.Password").Change("Password123!");
        cut.Find("#Input\\.ConfirmPassword").Change("Password123!");

        var createdUser = new User {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
                                   };

        // Mock the user creation flow
        _userManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"))
            .Returns(IdentityResult.Success);
        _userManager.GetUserIdAsync(Arg.Any<User>()).Returns(createdUser.Id.ToString());
        _userManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("ConfirmationToken");
        _userManager.Options.SignIn.RequireConfirmedAccount.Returns(true);

        // Act
        cut.Find("form").Submit();

        // Assert
        _signInManager.DidNotReceive().SignInAsync(Arg.Any<User>(), Arg.Any<bool>(), Arg.Any<string>());
        navigationManager!.History.Should().ContainSingle(x => x.Uri == "/account/register_confirmation");
    }
}