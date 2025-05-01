namespace VttTools.WebApp.Pages.Account;

public class ConfirmEmailPageTests : WebAppTestContext {
    private readonly UserManager<User> _userManager;
    private readonly HttpContext _httpContext;

    public ConfirmEmailPageTests() {
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

        _httpContext = Substitute.For<HttpContext>();
        var response = Substitute.For<HttpResponse>();
        _httpContext.Response.Returns(response);

        Services.AddScoped(_ => _userManager);
        Services.AddScoped(_ => _httpContext);
    }

    [Fact]
    public void ConfirmEmailPage_WithNoParameters_RedirectsToHome() {
        // Arrange
        var navigationManager = Services.GetRequiredService<NavigationManager>() as FakeNavigationManager;

        // Act
        var cut = RenderComponent<ConfirmEmailPage>();

        // Assert
        navigationManager!.History.Should().ContainSingle(x => x.Uri == "/");
    }

    [Fact]
    public void ConfirmEmailPage_WithInvalidUser_ShowsError() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());

        _userManager.FindByIdAsync(userId).Returns((User?)null);

        // Act
        var cut = RenderComponent<ConfirmEmailPage>(parameters => parameters
            .Add(p => p.UserId, userId)
            .Add(p => p.Code, code));

        // Assert
        cut.Markup.Should().Contain($"Error loading user with ID {userId}");
        _httpContext.Response.Received(1).StatusCode = StatusCodes.Status404NotFound;
    }

    [Fact]
    public void ConfirmEmailPage_WithValidParameters_ConfirmsEmail() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());
        var user = new User { Id = Guid.Parse(userId), Email = "test@example.com" };

        _userManager.FindByIdAsync(userId).Returns(user);
        _userManager.ConfirmEmailAsync(user, "SomeValidationCode").Returns(IdentityResult.Success);

        // Act
        var cut = RenderComponent<ConfirmEmailPage>(parameters => parameters
            .Add(p => p.UserId, userId)
            .Add(p => p.Code, code));

        // Assert
        cut.Markup.Should().Contain("Thank you for confirming your email.");
        _userManager.Received(1).ConfirmEmailAsync(user, "SomeValidationCode");
    }

    [Fact]
    public void ConfirmEmailPage_WithInvalidCode_ShowsError() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("InvalidCode"u8.ToArray());
        var user = new User { Id = Guid.Parse(userId), Email = "test@example.com" };

        _userManager.FindByIdAsync(userId).Returns(user);
        _userManager.ConfirmEmailAsync(user, "InvalidCode").Returns(IdentityResult.Failed(new IdentityError { Description = "Invalid token." }));

        // Act
        var cut = RenderComponent<ConfirmEmailPage>(parameters => parameters
            .Add(p => p.UserId, userId)
            .Add(p => p.Code, code));

        // Assert
        cut.Markup.Should().Contain("Error confirming your email.");
    }
}