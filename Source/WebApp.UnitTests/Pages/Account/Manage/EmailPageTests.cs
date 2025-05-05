namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageTests
    : WebAppTestContext {
    private readonly IEmailSender<User> _emailSender;

    public EmailPageTests() {
        UseDefaultUser();
        _emailSender = Substitute.For<IEmailSender<User>>();
        Services.AddSingleton(_emailSender);
    }

    [Fact]
    public void WhenDisplayed_WithConfirmedEmail_ShowsEmailChangeForm() {
        // Act
        var cut = RenderComponent<EmailPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Manage email</h3>");
        cut.Find("#change-email-form").Should().NotBeNull();
        cut.Find("#current-email-input").GetAttribute("value").Should().Be(CurrentUser!.DisplayName);
        cut.Find("#new-email-input").GetAttribute("value").Should().Be(string.Empty);
        cut.Find("#change-email-submit").TextContent.Should().Be("Change email");
    }

    [Fact]
    public void WhenDisplayed_WithUnconfirmedEmail_ShowsVerificationForm() {
        // Arrange
        UserManager.IsEmailConfirmedAsync(CurrentUser!).Returns(false);

        // Act
        var cut = RenderComponent<EmailPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Manage email</h3>");
        cut.Find("#verify-email-form").Should().NotBeNull();
        cut.Find("#email-input").GetAttribute("value").Should().Be(CurrentUser!.DisplayName);
        cut.Find("#verify-email-submit").TextContent.Should().Be("Verify email");
    }

    [Fact]
    public void ChangeEmailButtonIsClicked_WithEmptyEmail_ShowsErrorMessage() {
        // Arrange
        var cut = RenderComponent<EmailPage>();

        // Act
        cut.Find("#change-email-submit").Click();

        // Assert
        cut.Markup.Should().Contain("Error: The new email cannot be empty.");
        UserManager.DidNotReceive().GenerateChangeEmailTokenAsync(Arg.Any<User>(), Arg.Any<string>());
    }

    [Fact]
    public void ChangeEmailButtonIsClicked_WithSameEmail_ShowsUnchangedMessage() {
        // Arrange
        var cut = RenderComponent<EmailPage>();
        var newEmailInput = cut.Find("#new-email-input");
        newEmailInput.Change(CurrentUser!.Email);

        // Act
        cut.Find("#change-email-submit").Click();

        // Assert
        cut.Markup.Should().Contain("Your email was not changed.");
        UserManager.DidNotReceive().GenerateChangeEmailTokenAsync(Arg.Any<User>(), Arg.Any<string>());
    }

    [Fact]
    public void ChangeEmailButtonIsClicked_WithNewEmail_SendsConfirmationEmail() {
        // Arrange
        var cut = RenderComponent<EmailPage>();
        var newEmailInput = cut.Find("#new-email-input");
        newEmailInput.Change("new@example.com");

        UserManager.GenerateChangeEmailTokenAsync(Arg.Any<User>(), Arg.Any<string>()).Returns("token");

        // Act
        cut.Find("#change-email-submit").Click();

        // Assert
        cut.Markup.Should().Contain("A confirmation link was sent to the new email. Please check your email.");
        _emailSender.Received(1).SendConfirmationLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public void VerifyEmailButtonIsClicked_SendsVerificationEmail() {
        // Arrange
        UserManager.IsEmailConfirmedAsync(CurrentUser!).Returns(false);
        var cut = RenderComponent<EmailPage>();

        UserManager.GenerateEmailConfirmationTokenAsync(Arg.Any<User>()).Returns("token");

        // Act
        cut.Find("#verify-email-submit").Click();

        // Assert
        cut.Markup.Should().Contain("A confirmation link was sent to the email. Please check your email.");
        _emailSender.Received(1).SendConfirmationLinkAsync(Arg.Any<User>(), Arg.Any<string>(), Arg.Any<string>());
    }
}