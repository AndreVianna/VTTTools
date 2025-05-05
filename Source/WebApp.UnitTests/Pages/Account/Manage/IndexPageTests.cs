namespace VttTools.WebApp.Pages.Account.Manage;

public class IndexPageTests
    : WebAppTestContext {
    public IndexPageTests() {
        UseDefaultUser();
    }

    [Fact]
    public void WhenDisplayed_RendersCorrectly() {
        // Act
        var cut = RenderComponent<IndexPage>();

        // Assert
        cut.Markup.Should().Contain("<h3>Profile</h3>");
        cut.Find("#update-profile-form").Should().NotBeNull();
        cut.Find("#display-name-input").GetAttribute("value").Should().Be(CurrentUser!.DisplayName);
        cut.Find("#update-profile-submit").TextContent.Should().Be("Save");
    }

    [Fact]
    public void WhenSubmitted_WithUpdatedData_UpdatesUserProfile() {
        // Arrange
        var cut = RenderComponent<IndexPage>();
        var displayNameInput = cut.Find("display-name-input");
        displayNameInput.Change("New Name");

        UserManager.UpdateAsync(Arg.Any<User>()).Returns(IdentityResult.Success);

        // Act
        cut.Find("#update-profile-submit").Click();

        // Assert
        UserManager.Received(1).UpdateAsync(Arg.Any<User>());
        HttpContext.Received(1).SetStatusMessage("Your profile has been updated.");
    }

    [Fact]
    public void WhenSubmitted_WithSameData_DoesNotUpdateProfile() {
        // Arrange
        var cut = RenderComponent<IndexPage>();

        // Act
        cut.Find("#update-profile-submit").Click();

        // Assert
        UserManager.DidNotReceive().UpdateAsync(Arg.Any<User>());
        HttpContext.Received(1).SetStatusMessage("No changes were made to your profile.");
    }

    [Fact]
    public void WhenSubmitted_WithInvalidData_ShowsErrorMessage() {
        // Arrange
        var cut = RenderComponent<IndexPage>();
        var displayNameInput = cut.Find("display-name-input");
        displayNameInput.Change("");

        UserManager.UpdateAsync(Arg.Any<User>())
            .Returns(IdentityResult.Failed(new IdentityError { Description = "Display name is required." }));

        // Act
        cut.Find("#update-profile-submit").Click();

        // Assert
        UserManager.Received(1).UpdateAsync(Arg.Any<User>());
        HttpContext.Received(1).SetStatusMessage("Error: Failed to update user profile.");
    }
}