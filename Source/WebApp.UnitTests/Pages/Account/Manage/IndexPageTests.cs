namespace VttTools.WebApp.Pages.Account.Manage;

public class IndexPageTests : WebAppTestContext {
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly HttpContext _httpContext;
    private readonly User _defaultUser;

    public IndexPageTests() {
        UseDefaultUser();

        _defaultUser = new() {
            Id = Options.CurrentUser!.Id,
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

        var userAccessor = Substitute.For<IIdentityUserAccessor>();
        _httpContext = Substitute.For<HttpContext>();

        Services.AddScoped(_ => _userManager);
        Services.AddScoped(_ => _signInManager);
        Services.AddScoped(_ => userAccessor);
        Services.AddScoped(_ => _httpContext);

        userAccessor.GetCurrentUserOrRedirectAsync(Arg.Any<HttpContext>(), Arg.Any<UserManager<User>>())
            .Returns(Result.Success(_defaultUser));

        _userManager.GetUserNameAsync(_defaultUser).Returns("test@example.com");
        _userManager.GetPhoneNumberAsync(_defaultUser).Returns("555-123-4567");
    }

    [Fact]
    public void IndexPage_RendersCorrectly() {
        // Act
        var cut = RenderComponent<IndexPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Profile</h3>");
        var usernameInput = cut.Find("#username");
        usernameInput.GetAttribute("value").Should().Be("test@example.com");

        var phoneInput = cut.Find("#Input\\.PhoneNumber");
        phoneInput.GetAttribute("value").Should().Be("555-123-4567");
    }

    [Fact]
    public void Submitting_UpdatesUserProfile() {
        // Arrange
        var cut = RenderComponent<IndexPage>();

        // Change phone number
        var phoneInput = cut.Find("#Input\\.PhoneNumber");
        phoneInput.Change("555-987-6543");

        _userManager.SetPhoneNumberAsync(_defaultUser, "555-987-6543")
            .Returns(IdentityResult.Success);

        // Act
        cut.Find("form").Submit();

        // Assert
        _userManager.Received(1).SetPhoneNumberAsync(_defaultUser, "555-987-6543");
        _signInManager.Received(1).RefreshSignInAsync(_defaultUser);
    }

    [Fact]
    public void SubmittingWithSamePhoneNumber_DoesNotUpdateProfile() {
        // Arrange
        var cut = RenderComponent<IndexPage>();

        // Don't change phone number (keep as 555-123-4567)

        // Act
        cut.Find("form").Submit();

        // Assert
        _userManager.DidNotReceive().SetPhoneNumberAsync(Arg.Any<User>(), Arg.Any<string>());
        _signInManager.Received(1).RefreshSignInAsync(_defaultUser);
    }

    [Fact]
    public void FailedPhoneNumberUpdate_ShowsErrorMessage() {
        // Arrange
        var cut = RenderComponent<IndexPage>();

        // Change phone number
        var phoneInput = cut.Find("#Input\\.PhoneNumber");
        phoneInput.Change("invalid-number");

        _userManager.SetPhoneNumberAsync(_defaultUser, "invalid-number")
            .Returns(IdentityResult.Failed(new IdentityError { Description = "Invalid phone number" }));

        // Act
        cut.Find("form").Submit();

        // Assert
        _userManager.Received(1).SetPhoneNumberAsync(_defaultUser, "invalid-number");
        _httpContext.Received(1).SetStatusMessage("Error: Failed to set phone number.");
    }
}