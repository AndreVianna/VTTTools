namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageHandlerTests
    : WebAppTestContext {
    private readonly EmailPageHandler _handler;
    private readonly UserManager<User> _userManager;
    private readonly NavigationManager _navigationManager;
    private readonly IIdentityUserAccessor _userAccessor;
    private readonly IEmailSender<User> _emailSender;
    private readonly ILogger<EmailPage> _logger;
    private readonly HttpContext _httpContext;
    private readonly User _defaultUser;

    public EmailPageHandlerTests() {
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

        _navigationManager = Substitute.For<NavigationManager>();
        _userAccessor = Substitute.For<IIdentityUserAccessor>();
        _emailSender = Substitute.For<IEmailSender<User>>();
        _logger = Substitute.For<ILogger<EmailPage>>();
        _httpContext = Substitute.For<HttpContext>();

        _userAccessor.GetCurrentUserOrRedirectAsync(Arg.Any<HttpContext>(), Arg.Any<UserManager<User>>())
            .Returns(Result.Success(_defaultUser));

        _userManager.GetEmailAsync(_defaultUser).Returns("test@example.com");
        _userManager.IsEmailConfirmedAsync(_defaultUser).Returns(true);

        // Setup the NavigationManager to handle ToAbsoluteUri
        _navigationManager.ToAbsoluteUri(Arg.Any<string>()).Returns(info =>
            new($"https://example.com/{info.Arg<string>()}"));

        // Setup the NavigationManager to handle GetUriWithQueryParameters
        _navigationManager.GetUriWithQueryParameters(
            Arg.Any<string>(),
            Arg.Any<Dictionary<string, object?>>()
        ).Returns(info => $"{info.ArgAt<string>(0)}?params=true");
    }

    [Fact]
    public async Task TryInitializeAsync_SuccessfullyLoadsUserData() {
        // Act
        var result = await _handler.TryInitializeAsync(
            _httpContext,
            _userManager,
            _navigationManager,
            _userAccessor,
            _emailSender,
            _logger);

        // Assert
        result.Should().BeTrue();
        _handler.State.User.Should().Be(_defaultUser);
        _handler.State.Email.Should().Be("test@example.com");
        _handler.State.IsEmailConfirmed.Should().BeTrue();
        _handler.State.Input.Email.Should().Be("test@example.com");
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
            _navigationManager,
            _userAccessor,
            _emailSender,
            _logger);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ChangeEmailAsync_WithSameEmail_SetsUnchangedMessage() {
        // Arrange
        await _handler.TryInitializeAsync(
            _httpContext,
            _userManager,
            _navigationManager,
            _userAccessor,
            _emailSender,
            _logger);

        // Input.NewEmail is already set to "test@example.com" which is the same as the current email

        // Act
        await _handler.SendEmailChangeConfirmationAsync();

        // Assert
        _handler.State.Message.Should().Be("Your email is unchanged.");
        await _userManager.DidNotReceive().GenerateChangeEmailTokenAsync(Arg.Any<User>(), Arg.Any<string>());
    }

    [Fact]
    public async Task ChangeEmailAsync_WithNewEmail_SendsConfirmationEmail() {
        // Arrange
        await _handler.TryInitializeAsync(
            _httpContext,
            _userManager,
            _navigationManager,
            _userAccessor,
            _emailSender,
            _logger);

        _handler.State.Input.Email = "new@example.com";

        _userManager.GetUserIdAsync(_defaultUser).Returns(_defaultUser.Id.ToString());
        _userManager.GenerateChangeEmailTokenAsync(_defaultUser, "new@example.com").Returns("token");

        // Act
        await _handler.SendEmailChangeConfirmationAsync();

        // Assert
        _handler.State.Message.Should().Be("Confirmation link to change email sent. Please check your email.");
        await _emailSender.Received(1).SendConfirmationLinkAsync(_defaultUser, "new@example.com", Arg.Any<string>());
    }

    [Fact]
    public async Task SendEmailVerificationAsync_SendsVerificationEmail() {
        // Arrange
        await _handler.TryInitializeAsync(
            _httpContext,
            _userManager,
            _navigationManager,
            _userAccessor,
            _emailSender,
            _logger);

        _userManager.GetUserIdAsync(_defaultUser).Returns(_defaultUser.Id.ToString());
        _userManager.GenerateEmailConfirmationTokenAsync(_defaultUser).Returns("token");

        // Act
        await _handler.SendEmailVerificationAsync();

        // Assert
        _handler.State.Message.Should().Be("Verification email sent. Please check your email.");
        await _emailSender.Received(1).SendConfirmationLinkAsync(_defaultUser, "test@example.com", Arg.Any<string>());
    }

    [Fact]
    public async Task SendEmailVerificationAsync_WithNullEmail_DoesNothing() {
        // Arrange
        await _handler.TryInitializeAsync(
            _httpContext,
            _userManager,
            _navigationManager,
            _userAccessor,
            _emailSender,
            _logger);

        _handler.State.Email = null;

        // Act
        await _handler.SendEmailVerificationAsync();

        // Assert
        await _userManager.DidNotReceive().GetUserIdAsync(Arg.Any<User>());
        await _emailSender.DidNotReceive().SendConfirmationLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }
}