namespace VttTools.WebApp.Pages.Account;

public class ConfirmEmailPageHandlerTests {
    private readonly ConfirmEmailPageHandler _handler;
    private readonly UserManager<User> _userManager;
    private readonly NavigationManager _navigationManager;
    private readonly HttpContext _httpContext;

    public ConfirmEmailPageHandlerTests() {
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

        _navigationManager = Substitute.For<NavigationManager>();

        _httpContext = Substitute.For<HttpContext>();
        var response = Substitute.For<HttpResponse>();
        _httpContext.Response.Returns(response);
    }

    [Fact]
    public async Task InitializeAsync_WithNullParameters_RedirectsToHome() {
        // Act
        await _handler.InitializeAsync(null, null, _userManager, _navigationManager, _httpContext);

        // Assert
        _navigationManager.Received(1).RedirectToHome();
        await _userManager.DidNotReceive().FindByIdAsync(Arg.Any<string>());
    }

    [Fact]
    public async Task InitializeAsync_WithInvalidUserId_SetsNotFoundAndErrorMessage() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());

        _userManager.FindByIdAsync(userId).Returns((User?)null);

        // Act
        await _handler.InitializeAsync(userId, code, _userManager, _navigationManager, _httpContext);

        // Assert
        _httpContext.Response.Received(1).StatusCode = StatusCodes.Status404NotFound;
        _handler.State.StatusMessage.Should().Be($"Error loading user with ID {userId}");
    }

    [Fact]
    public async Task InitializeAsync_WithValidParameters_ConfirmsEmailAndSetsSuccessMessage() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());
        var user = new User { Id = Guid.Parse(userId), Email = "test@example.com" };

        _userManager.FindByIdAsync(userId).Returns(user);
        _userManager.ConfirmEmailAsync(user, "SomeValidationCode").Returns(IdentityResult.Success);

        // Act
        await _handler.InitializeAsync(userId, code, _userManager, _navigationManager, _httpContext);

        // Assert
        _handler.State.StatusMessage.Should().Be("Thank you for confirming your email.");
        await _userManager.Received(1).ConfirmEmailAsync(user, "SomeValidationCode");
    }

    [Fact]
    public async Task InitializeAsync_WithInvalidCode_SetsErrorMessage() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("InvalidCode"u8.ToArray());
        var user = new User { Id = Guid.Parse(userId), Email = "test@example.com" };

        _userManager.FindByIdAsync(userId).Returns(user);
        _userManager.ConfirmEmailAsync(user, "InvalidCode").Returns(IdentityResult.Failed(new IdentityError { Description = "Invalid token." }));

        // Act
        await _handler.InitializeAsync(userId, code, _userManager, _navigationManager, _httpContext);

        // Assert
        _handler.State.StatusMessage.Should().Be("Error confirming your email.");
    }
}