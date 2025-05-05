namespace VttTools.WebApp.Pages.Account.Manage;

public class IndexPageHandlerTests
    : WebAppTestContext {
    private readonly IndexPageHandler _handler;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly NavigationManager _navigationManager;
    private readonly IIdentityUserAccessor _userAccessor;
    private readonly ILogger<IndexPage> _logger;
    private readonly HttpContext _httpContext;
    private readonly User _defaultUser;

    public IndexPageHandlerTests() {
        _handler = new();

        _defaultUser = new() {
            Id = Guid.NewGuid(),
            UserName = "test@example.com",
            PhoneNumber = "555-123-4567",
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
        _logger = Substitute.For<ILogger<IndexPage>>();
        _httpContext = Substitute.For<HttpContext>();

        _userAccessor.GetCurrentUserOrRedirectAsync(Arg.Any<HttpContext>(), Arg.Any<UserManager<User>>())
            .Returns(Result.Success(_defaultUser));

        _userManager.GetUserNameAsync(_defaultUser).Returns("test@example.com");
        _userManager.GetPhoneNumberAsync(_defaultUser).Returns("555-123-4567");
    }

    [Fact]
    public async Task TryInitializeAsync_LoadsUserData() {
        // Act
        var result = await _handler.TryInitializeAsync(
            _httpContext,
            _userManager,
            _signInManager,
            _navigationManager,
            _userAccessor,
            _logger);

        // Assert
        result.Should().BeTrue();
        _handler.State.Username.Should().Be("test@example.com");
        _handler.State.PhoneNumber.Should().Be("555-123-4567");
        _handler.State.Input.PhoneNumber.Should().Be("555-123-4567");
    }

    [Fact]
    public async Task TryInitializeAsync_WhenUserNotFound_ReturnsFalse() {
        // Arrange
        _userAccessor.GetCurrentUserOrRedirectAsync(Arg.Any<HttpContext>(), Arg.Any<UserManager<User>>())
            .Returns(Result.Failure("User not found"));

        // Act
        var result = await _handler.TryInitializeAsync(
            _httpContext,
            _userManager,
            _signInManager,
            _navigationManager,
            _userAccessor,
            _logger);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateProfileAsync_WithChangedPhoneNumber_UpdatesPhoneNumber() {
        // Arrange
        await _handler.TryInitializeAsync(
            _httpContext,
            _userManager,
            _signInManager,
            _navigationManager,
            _userAccessor,
            _logger);

        _handler.State.Input.PhoneNumber = "555-987-6543";

        _userManager.SetPhoneNumberAsync(_defaultUser, "555-987-6543")
            .Returns(IdentityResult.Success);

        // Act
        var result = await _handler.UpdateProfileAsync();

        // Assert
        result.Should().BeTrue();
        await _userManager.Received(1).SetPhoneNumberAsync(_defaultUser, "555-987-6543");
        await _signInManager.Received(1).RefreshSignInAsync(_defaultUser);
    }

    [Fact]
    public async Task UpdateProfileAsync_WithSamePhoneNumber_DoesNotUpdatePhoneNumber() {
        // Arrange
        await _handler.TryInitializeAsync(
            _httpContext,
            _userManager,
            _signInManager,
            _navigationManager,
            _userAccessor,
            _logger);

        // Phone number is already "555-123-4567" in both state and input

        // Act
        var result = await _handler.UpdateProfileAsync();

        // Assert
        result.Should().BeTrue();
        await _userManager.DidNotReceive().SetPhoneNumberAsync(Arg.Any<User>(), Arg.Any<string>());
        await _signInManager.Received(1).RefreshSignInAsync(_defaultUser);
    }

    [Fact]
    public async Task UpdateProfileAsync_WithFailedPhoneNumberUpdate_ReturnsFalse() {
        // Arrange
        await _handler.TryInitializeAsync(
            _httpContext,
            _userManager,
            _signInManager,
            _navigationManager,
            _userAccessor,
            _logger);

        _handler.State.Input.PhoneNumber = "invalid-number";

        _userManager.SetPhoneNumberAsync(_defaultUser, "invalid-number")
            .Returns(IdentityResult.Failed(new IdentityError { Description = "Invalid phone number" }));

        // Act
        var result = await _handler.UpdateProfileAsync();

        // Assert
        result.Should().BeFalse();
        await _userManager.Received(1).SetPhoneNumberAsync(_defaultUser, "invalid-number");
        _httpContext.Received(1).SetStatusMessage("Error: Failed to set phone number.");
    }
}