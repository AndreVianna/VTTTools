namespace VttTools.WebApp.Pages.Account;

public class RegisterPageHandlerTests
    : WebAppTestContext {
    private readonly IEmailSender<User> _emailSender = Substitute.For<IEmailSender<User>>();

    public RegisterPageHandlerTests() {
        Services.AddScoped(_ => _emailSender);
    }

    [Fact]
    public async Task ConfigureAsync_SetsExternalLoginProviders() {
        // Arrange
        var handler = await CreateHandler(false);
        var scheme = new AuthenticationScheme("Google", "Google", typeof(IAuthenticationHandler));
        SignInManager.GetExternalAuthenticationSchemesAsync().Returns([scheme]);

        // Act
        await handler.ConfigureAsync();

        // Assert
        handler.State.HasExternalLoginProviders.Should().BeTrue();
    }

    [Fact]
    public async Task RegisterUserAsync_WhenCreateFails_SetsErrors() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.Input.Name = "Test User";
        handler.State.Input.Email = "test@example.com";
        handler.State.Input.Password = "weak";
        handler.State.Input.PasswordConfirmation = "weak";

        var identityErrors = new IdentityError[] { new() { Description = "Password too weak" } };
        UserManager.CreateAsync(Arg.Any<User>(), Arg.Any<string>())
                   .Returns(IdentityResult.Failed(identityErrors));

        // Act
        var result = await handler.RegisterUserAsync(null);

        // Assert
        result.Should().BeFalse();
        handler.State.IdentityErrors.Should().BeEquivalentTo(identityErrors);
    }

    [Fact]
    public async Task RegisterUserAsync_WhenCreateSucceeds_ReturnsTrue() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.Input.Name = "Test User";
        handler.State.Input.Email = "test@example.com";
        handler.State.Input.Password = "Password123!";
        handler.State.Input.PasswordConfirmation = "Password123!";

        var createdUser = new User {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
        };

        UserManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"))
            .Returns(IdentityResult.Success);
        UserManager.GetUserIdAsync(Arg.Any<User>()).Returns(createdUser.Id.ToString());
        UserManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("ConfirmationToken");

        // Act
        var result = await handler.RegisterUserAsync(null);

        // Assert
        result.Should().BeTrue();
        await UserManager.Received(1).CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"));
        await SignInManager.Received(1).SignInAsync(Arg.Any<User>(), Arg.Is<bool>(b => !b), Arg.Any<string>());
    }

    [Fact]
    public async Task RegisterUserAsync_WhenRequireConfirmedAccount_RedirectsToConfirmation() {
        // Arrange
        var handler = await CreateHandler();
        handler.State.Input.Name = "Test User";
        handler.State.Input.Email = "test@example.com";
        handler.State.Input.Password = "Password123!";
        handler.State.Input.PasswordConfirmation = "Password123!";

        var createdUser = new User {
            Id = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
        };

        UserManager.CreateAsync(Arg.Any<User>(), Arg.Is<string>(s => s == "Password123!"))
            .Returns(IdentityResult.Success);
        UserManager.GetUserIdAsync(Arg.Any<User>()).Returns(createdUser.Id.ToString());
        UserManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("ConfirmationToken");
        UserManager.Options.SignIn.RequireConfirmedAccount = true;

        // Act
        var result = await handler.RegisterUserAsync("/return-url");

        // Assert
        result.Should().BeTrue();
        NavigationManager.History.First().Uri.Should().Be("account/register_confirmation?email=test%40example.com&returnUrl=%2Freturn-url");
        await SignInManager.DidNotReceive().SignInAsync(Arg.Any<User>(), Arg.Any<bool>(), Arg.Any<string>());
    }

    private async Task<RegisterPageHandler> CreateHandler(bool isConfigured = true) {
        var page = Substitute.For<IPublicPage>();
        page.HttpContext.Returns(HttpContext);
        page.NavigationManager.Returns(NavigationManager);
        page.Logger.Returns(NullLogger.Instance);
        var handler = new RegisterPageHandler(page);
        if (isConfigured)
            await handler.ConfigureAsync();
        return handler;
    }
}