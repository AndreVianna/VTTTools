namespace VttTools.WebApp.Pages.Account.Manage;

public class ChangePasswordPageHandlerTests {
    private readonly ChangePasswordPageHandler _handler;
    private readonly UserManager<User> _userManager;
    private readonly NavigationManager _navigationManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IIdentityUserAccessor _userAccessor;
    private readonly ILogger<ChangePasswordPage> _logger;
    private readonly HttpContext _httpContext;
    private readonly User _defaultUser;

    public ChangePasswordPageHandlerTests() {
        _handler = new();

        _defaultUser = new() {
            Id = Guid.NewGuid(),
            UserName = "test@example.com",
            Email = "test@example.com",
                             };

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
        _userAccessor = Substitute.For<IIdentityUserAccessor>();
        _logger = Substitute.For<ILogger<ChangePasswordPage>>();
        _httpContext = Substitute.For<HttpContext>();

        _userAccessor.GetCurrentUserOrRedirectAsync(Arg.Any<HttpContext>(), Arg.Any<UserManager<User>>())
            .Returns(Result.Success(_defaultUser));

        _userManager.HasPasswordAsync(_defaultUser).Returns(true);
    }

    [Fact]
    public async Task TryInitializeAsync_WhenUserHasPassword_SetsStateAndReturnsTrue() {
        // Act
        var result = await _handler.InitializeAsync(
            _httpContext,
            _userManager,
            _navigationManager,
            _signInManager,
            _userAccessor,
            _logger);

        // Assert
        result.Should().BeTrue();
        _handler.State.User.Should().Be(_defaultUser);
        _handler.State.HasPassword.Should().BeTrue();
    }

    [Fact]
    public async Task TryInitializeAsync_WhenUserHasNoPassword_RedirectsToSetPassword() {
        // Arrange
        _userManager.HasPasswordAsync(_defaultUser).Returns(false);

        // Act
        var result = await _handler.InitializeAsync(
            _httpContext,
            _userManager,
            _navigationManager,
            _signInManager,
            _userAccessor,
            _logger);

        // Assert
        result.Should().BeFalse();
        _navigationManager.Received(1).RedirectTo("account/manage/set_password");
    }

    [Fact]
    public async Task TryInitializeAsync_WhenUserNotFound_ReturnsFalse() {
        // Arrange
        _userAccessor.GetCurrentUserOrRedirectAsync(Arg.Any<HttpContext>(), Arg.Any<UserManager<User>>())
            .Returns(Result.Failure("User not found"));

        // Act
        var result = await _handler.InitializeAsync(
            _httpContext,
            _userManager,
            _navigationManager,
            _signInManager,
            _userAccessor,
            _logger);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ChangePasswordAsync_WithSuccessfulChange_RefreshesSignIn() {
        // Arrange
        await _handler.InitializeAsync(
            _httpContext,
            _userManager,
            _navigationManager,
            _signInManager,
            _userAccessor,
            _logger);

        _handler.State.Input.OldPassword = "OldPassword123!";
        _handler.State.Input.NewPassword = "NewPassword123!";
        _handler.State.Input.ConfirmPassword = "NewPassword123!";

        _userManager.ChangePasswordAsync(
            _defaultUser,
            "OldPassword123!",
            "NewPassword123!"
        ).Returns(IdentityResult.Success);

        // Act
        var result = await _handler.ChangePasswordAsync();

        // Assert
        result.Should().BeTrue();
        _handler.State.Message.Should().BeNull();
        await _signInManager.Received(1).RefreshSignInAsync(_defaultUser);
        _httpContext.Received(1).SetStatusMessage("Your password has been changed");
    }

    [Fact]
    public async Task ChangePasswordAsync_WithFailure_SetsErrorMessage() {
        // Arrange
        await _handler.InitializeAsync(
            _httpContext,
            _userManager,
            _navigationManager,
            _signInManager,
            _userAccessor,
            _logger);

        _handler.State.Input.OldPassword = "WrongPassword";
        _handler.State.Input.NewPassword = "NewPassword123!";
        _handler.State.Input.ConfirmPassword = "NewPassword123!";

        var errors = new IdentityError[] { new() { Description = "Incorrect password." } };
        _userManager.ChangePasswordAsync(
            _defaultUser,
            "WrongPassword",
            "NewPassword123!"
        ).Returns(IdentityResult.Failed(errors));

        // Act
        var result = await _handler.ChangePasswordAsync();

        // Assert
        result.Should().BeFalse();
        _handler.State.Message.Should().Be("Error: Incorrect password.");
        await _signInManager.DidNotReceive().RefreshSignInAsync(Arg.Any<User>());
    }
}