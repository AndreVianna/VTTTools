namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageTests : WebAppTestContext {
    private readonly UserManager<User> _userManager;
    private readonly IEmailSender<User> _emailSender;
    private readonly User _defaultUser;

    public EmailPageTests() {
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

        var userAccessor = Substitute.For<IIdentityUserAccessor>();
        _emailSender = Substitute.For<IEmailSender<User>>();
        var httpContext = Substitute.For<HttpContext>();

        Services.AddScoped(_ => _userManager);
        Services.AddScoped(_ => userAccessor);
        Services.AddScoped(_ => _emailSender);
        Services.AddScoped(_ => httpContext);

        userAccessor.GetCurrentUserOrRedirectAsync(Arg.Any<HttpContext>(), Arg.Any<UserManager<User>>())
            .Returns(Result.Success(_defaultUser));

        _userManager.GetEmailAsync(_defaultUser).Returns("test@example.com");
        _userManager.IsEmailConfirmedAsync(_defaultUser).Returns(true);
    }

    [Fact]
    public void EmailPage_WithConfirmedEmail_RendersCorrectly() {
        // Act
        var cut = RenderComponent<EmailPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Manage email</h3>");
        cut.Markup.Should().Contain("text-success font-weight-bold");
        cut.Markup.Should().NotContain("Send verification email");

        var emailInput = cut.Find("#email");
        emailInput.GetAttribute("value").Should().Be("test@example.com");

        var newEmailInput = cut.Find("#Input\\.NewEmail");
        newEmailInput.GetAttribute("value").Should().Be("test@example.com");

        var submitButton = cut.Find("button[type=submit]");
        submitButton.TextContent.Should().Be("Change email");
    }

    [Fact]
    public void EmailPage_WithUnconfirmedEmail_ShowsVerificationButton() {
        // Arrange
        _userManager.IsEmailConfirmedAsync(_defaultUser).Returns(false);

        // Act
        var cut = RenderComponent<EmailPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Manage email</h3>");
        cut.Markup.Should().NotContain("text-success font-weight-bold");
        cut.Markup.Should().Contain("Send verification email");

        var verificationButton = cut.Find("button.btn-link");
        verificationButton.TextContent.Should().Be("Send verification email");
    }

    [Fact]
    public void SubmittingChangeEmail_WithSameEmail_ShowsUnchangedMessage() {
        // Arrange
        var cut = RenderComponent<EmailPage>();

        // Act
        cut.Find("form[formname=change-email]").Submit();

        // Assert
        cut.WaitForState(() => cut.Instance.State.Message != null);
        cut.Markup.Should().Contain("Your email is unchanged.");
        _userManager.DidNotReceive().GenerateChangeEmailTokenAsync(Arg.Any<User>(), Arg.Any<string>());
    }

    [Fact]
    public void SubmittingChangeEmail_WithNewEmail_SendsConfirmationEmail() {
        // Arrange
        var cut = RenderComponent<EmailPage>();

        // Change the email
        var newEmailInput = cut.Find("#Input\\.NewEmail");
        newEmailInput.Change("new@example.com");

        _userManager.GetUserIdAsync(_defaultUser).Returns(_defaultUser.Id.ToString());
        _userManager.GenerateChangeEmailTokenAsync(_defaultUser, "new@example.com").Returns("token");

        // Act
        cut.Find("form[formname=change-email]").Submit();

        // Assert
        cut.WaitForState(() => cut.Instance.State.Message != null);
        cut.Markup.Should().Contain("Confirmation link to change email sent. Please check your email.");
        _emailSender.Received(1).SendConfirmationLinkAsync(_defaultUser, "new@example.com", Arg.Any<string>());
    }

    [Fact]
    public void ClickingSendVerificationEmail_WithUnconfirmedEmail_SendsVerificationEmail() {
        // Arrange
        _userManager.IsEmailConfirmedAsync(_defaultUser).Returns(false);
        var cut = RenderComponent<EmailPage>();

        _userManager.GetUserIdAsync(_defaultUser).Returns(_defaultUser.Id.ToString());
        _userManager.GenerateEmailConfirmationTokenAsync(_defaultUser).Returns("token");

        // Act
        cut.Find("form#send-verification-form").Submit();

        // Assert
        cut.WaitForState(() => cut.Instance.State.Message != null);
        cut.Markup.Should().Contain("Verification email sent. Please check your email.");
        _emailSender.Received(1).SendConfirmationLinkAsync(_defaultUser, "test@example.com", Arg.Any<string>());
    }
}