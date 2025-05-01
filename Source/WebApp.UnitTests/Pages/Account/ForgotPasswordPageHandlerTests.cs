namespace VttTools.WebApp.Pages.Account;

public class ForgotPasswordPageHandlerTests {
    private readonly ForgotPasswordPageHandler _handler;
    private readonly UserManager<User> _userManager;
    private readonly NavigationManager _navigationManager;
    private readonly IEmailSender<User> _emailSender;

    public ForgotPasswordPageHandlerTests() {
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
        _emailSender = Substitute.For<IEmailSender<User>>();

        _handler.Initialize(_userManager, _navigationManager, _emailSender);
    }

    [Fact]
    public async Task RequestPasswordResetAsync_WithNonExistentEmail_RedirectsToConfirmationPage() {
        // Arrange
        _handler.State.Input.Email = "nonexistent@example.com";
        _userManager.FindByEmailAsync("nonexistent@example.com").Returns((User?)null);

        // Act
        await _handler.RequestPasswordResetAsync();

        // Assert
        _navigationManager.Received(1).RedirectTo("account/forgot_password_confirmation");
        await _emailSender.DidNotReceive().SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task RequestPasswordResetAsync_WithUnconfirmedEmail_RedirectsToConfirmationPage() {
        // Arrange
        _handler.State.Input.Email = "unconfirmed@example.com";

        var user = new User { Email = "unconfirmed@example.com" };
        _userManager.FindByEmailAsync("unconfirmed@example.com").Returns(user);
        _userManager.IsEmailConfirmedAsync(user).Returns(false);

        // Act
        await _handler.RequestPasswordResetAsync();

        // Assert
        _navigationManager.Received(1).RedirectTo("account/forgot_password_confirmation");
        await _emailSender.DidNotReceive().SendPasswordResetLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task RequestPasswordResetAsync_WithValidEmail_SendsResetLinkAndRedirects() {
        // Arrange
        _handler.State.Input.Email = "valid@example.com";

        var user = new User { Email = "valid@example.com" };
        _userManager.FindByEmailAsync("valid@example.com").Returns(user);
        _userManager.IsEmailConfirmedAsync(user).Returns(true);
        _userManager.GeneratePasswordResetTokenAsync(user).Returns("ResetToken");

        // Setup the URI conversions for NavigationManager
        _navigationManager.ToAbsoluteUri(Arg.Any<string>()).Returns(new Uri("https://example.com/account/reset_password"));
        _navigationManager.GetUriWithQueryParameters(
            Arg.Any<string>(),
            Arg.Any<Dictionary<string, object?>>()
        ).Returns("https://example.com/account/reset_password?code=ResetToken");

        // Act
        await _handler.RequestPasswordResetAsync();

        // Assert
        _navigationManager.Received(1).RedirectTo("account/forgot_password_confirmation");
        await _emailSender.Received(1).SendPasswordResetLinkAsync(
            Arg.Is<User>(u => u.Email == "valid@example.com"),
            Arg.Is<string>(s => s == "valid@example.com"),
            Arg.Any<string>());
    }
}