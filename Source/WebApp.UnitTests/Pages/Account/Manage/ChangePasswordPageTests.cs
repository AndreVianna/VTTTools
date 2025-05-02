namespace VttTools.WebApp.Pages.Account.Manage;

public class ChangePasswordPageTests : WebAppTestContext {
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly User _defaultUser;

    public ChangePasswordPageTests() {
        UseDefaultUser();

        _defaultUser = new() {
            Id = Options.CurrentUser!.Id,
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

        var userAccessor = Substitute.For<IIdentityUserAccessor>();
        var httpContext = Substitute.For<HttpContext>();

        Services.AddScoped(_ => _userManager);
        Services.AddScoped(_ => _signInManager);
        Services.AddScoped(_ => userAccessor);
        Services.AddScoped(_ => httpContext);

        userAccessor.GetCurrentUserOrRedirectAsync(Arg.Any<HttpContext>(), Arg.Any<UserManager<User>>())
            .Returns(Result.Success(_defaultUser));

        _userManager.HasPasswordAsync(_defaultUser).Returns(true);
    }

    [Fact]
    public void ChangePasswordPage_RendersCorrectly() {
        // Act
        var cut = RenderComponent<ChangePasswordPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Change password</h3>");

        var oldPasswordInput = cut.Find("#Input\\.OldPassword");
        oldPasswordInput.Should().NotBeNull();

        var newPasswordInput = cut.Find("#Input\\.NewPassword");
        newPasswordInput.Should().NotBeNull();

        var confirmPasswordInput = cut.Find("#Input\\.ConfirmPassword");
        confirmPasswordInput.Should().NotBeNull();

        var submitButton = cut.Find("button[type=submit]");
        submitButton.TextContent.Should().Be("Update password");
    }

    [Fact]
    public void ChangePasswordPage_WithNoPassword_RedirectsToSetPassword() {
        // Arrange
        _userManager.HasPasswordAsync(_defaultUser).Returns(false);

        // Act
        var cut = RenderComponent<ChangePasswordPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == "account/manage/set_password");
    }

    [Fact]
    public void SubmittingForm_WithSuccess_UpdatesPassword() {
        // Arrange
        var cut = RenderComponent<ChangePasswordPage>();

        // Fill form
        cut.Find("#Input\\.OldPassword").Change("OldPassword123!");
        cut.Find("#Input\\.NewPassword").Change("NewPassword123!");
        cut.Find("#Input\\.ConfirmPassword").Change("NewPassword123!");

        _userManager.ChangePasswordAsync(
            _defaultUser,
            "OldPassword123!",
            "NewPassword123!"
        ).Returns(IdentityResult.Success);

        // Act
        cut.Find("form").Submit();

        // Assert
        _userManager.Received(1).ChangePasswordAsync(
            _defaultUser,
            "OldPassword123!",
            "NewPassword123!"
        );
        _signInManager.Received(1).RefreshSignInAsync(_defaultUser);
    }

    [Fact]
    public void SubmittingForm_WithFailure_ShowsErrorMessage() {
        // Arrange
        var cut = RenderComponent<ChangePasswordPage>();

        // Fill form
        cut.Find("#Input\\.OldPassword").Change("WrongPassword");
        cut.Find("#Input\\.NewPassword").Change("NewPassword123!");
        cut.Find("#Input\\.ConfirmPassword").Change("NewPassword123!");

        var errors = new IdentityError[] { new() { Description = "Incorrect password." } };
        _userManager.ChangePasswordAsync(
            _defaultUser,
            "WrongPassword",
            "NewPassword123!"
        ).Returns(IdentityResult.Failed(errors));

        // Act
        cut.Find("form").Submit();

        // Assert
        cut.WaitForState(() => cut.Instance.State.Message != null);
        cut.Markup.Should().Contain("Error: Incorrect password.");
        _signInManager.DidNotReceive().RefreshSignInAsync(Arg.Any<User>());
    }
}